/**
 * Chat Service
 * Business logic for chat operations and streaming
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  GuestConversation,
  CreateConversationInput,
  DbPersonality,
  Message,
} from '../types/chat.types';

// ============================================================================
// Guest Mode Helpers
// ============================================================================

/**
 * Create a guest conversation
 */
export function createGuestConversation(
  personalityId: string,
  displayName: string
): GuestConversation {
  const guestConversationId = `guest-${personalityId}-${Date.now()}`;
  
  const guestConversation: GuestConversation = {
    id: guestConversationId,
    personality_id: personalityId,
    display_name: displayName,
    title: `Chat with ${displayName}`,
    created_at: new Date().toISOString(),
    messages: [],
  };

  localStorage.setItem(
    `guest-conversation-${guestConversationId}`,
    JSON.stringify(guestConversation)
  );

  return guestConversation;
}

/**
 * Get guest conversation from localStorage
 */
export function getGuestConversation(conversationId: string): GuestConversation | null {
  const key = `guest-conversation-${conversationId}`;
  const data = localStorage.getItem(key);
  
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to parse guest conversation:', err);
    return null;
  }
}

/**
 * Update guest conversation messages
 */
export function updateGuestConversation(
  conversationId: string,
  messages: Message[]
): void {
  const conversation = getGuestConversation(conversationId);
  
  if (!conversation) {
    throw new Error('Guest conversation not found');
  }

  conversation.messages = messages;
  
  localStorage.setItem(
    `guest-conversation-${conversationId}`,
    JSON.stringify(conversation)
  );
}

/**
 * Get all guest conversations
 */
export function getAllGuestConversations(): GuestConversation[] {
  const conversations: GuestConversation[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    if (key?.startsWith('guest-conversation-')) {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          conversations.push(JSON.parse(data));
        } catch (err) {
          console.error('Failed to parse guest conversation:', err);
        }
      }
    }
  }
  
  return conversations.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * Delete guest conversation
 */
export function deleteGuestConversation(conversationId: string): void {
  localStorage.removeItem(`guest-conversation-${conversationId}`);
}

// ============================================================================
// Conversation Helpers
// ============================================================================

/**
 * Create conversation (handles both guest and authenticated)
 */
export async function createConversation(
  input: CreateConversationInput & { isGuest?: boolean }
): Promise<{ id: string; isGuest: boolean }> {
  if (input.isGuest) {
    // Get personality info
    const { data: personality } = await supabase
      .from('personalities')
      .select('display_name')
      .eq('id', input.personalityId)
      .single();
    
    const guestConv = createGuestConversation(
      input.personalityId,
      personality?.display_name || 'Unknown'
    );
    
    return { id: guestConv.id, isGuest: true };
  }

  // Create authenticated conversation
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert([
      {
        user_id: user.id,
        personality_id: input.personalityId,
        title: input.title || 'New Conversation',
      },
    ])
    .select('id')
    .single();

  if (error) throw error;

  return { id: data.id, isGuest: false };
}

// ============================================================================
// Message Helpers
// ============================================================================

/**
 * Get conversation messages (handles both guest and authenticated)
 */
export async function getConversationMessages(
  conversationId: string
): Promise<Message[]> {
  if (conversationId.startsWith('guest-')) {
    const guestConv = getGuestConversation(conversationId);
    return guestConv?.messages || [];
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data as Message[];
}

/**
 * Save message (handles both guest and authenticated)
 */
export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string
): Promise<Message> {
  if (conversationId.startsWith('guest-')) {
    const guestConv = getGuestConversation(conversationId);
    
    if (!guestConv) {
      throw new Error('Guest conversation not found');
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversation_id: conversationId,
      role,
      content,
      created_at: new Date().toISOString(),
    };

    guestConv.messages.push(newMessage);
    
    localStorage.setItem(
      `guest-conversation-${conversationId}`,
      JSON.stringify(guestConv)
    );

    return newMessage;
  }

  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        conversation_id: conversationId,
        role,
        content,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data as Message;
}

// ============================================================================
// Personality Helpers
// ============================================================================

/**
 * Get personality by ID
 */
export async function getPersonality(personalityId: string): Promise<DbPersonality> {
  const { data, error } = await supabase
    .from('personalities')
    .select('*')
    .eq('id', personalityId)
    .single();

  if (error) throw error;

  return {
    ...data,
    values_pillars: Array.isArray(data.values_pillars)
      ? data.values_pillars.map(String)
      : [],
  } as DbPersonality;
}

/**
 * Get all personalities
 */
export async function getAllPersonalities(): Promise<DbPersonality[]> {
  const { data, error } = await supabase
    .from('personalities')
    .select('*')
    .order('display_name');

  if (error) throw error;

  return (data || []).map((p) => ({
    ...p,
    values_pillars: Array.isArray(p.values_pillars)
      ? p.values_pillars.map(String)
      : [],
  })) as DbPersonality[];
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

/**
 * Format conversation title from messages
 */
export function generateConversationTitle(messages: Message[]): string {
  const firstUserMessage = messages.find((m) => m.role === 'user');
  
  if (!firstUserMessage) return 'New Conversation';

  // Take first 50 characters of first user message
  const title = firstUserMessage.content.slice(0, 50);
  return title.length < firstUserMessage.content.length ? `${title}...` : title;
}
