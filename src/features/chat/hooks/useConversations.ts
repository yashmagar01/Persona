/**
 * TanStack Query Hooks for Conversation & Message Management
 * Server state management with caching, optimistic updates, and mutations
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type {
  Conversation,
  ConversationWithPersonality,
  Message,
  CreateConversationInput,
  UpdateConversationInput,
  ConversationFilters,
} from '../types/chat.types';

// ============================================================================
// Query Keys Factory
// ============================================================================

export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  conversation: (id: string) => [...chatKeys.conversations(), id] as const,
  messages: (conversationId: string) => [...chatKeys.all, 'messages', conversationId] as const,
  personalities: () => [...chatKeys.all, 'personalities'] as const,
};

// ============================================================================
// Conversation Queries
// ============================================================================

/**
 * Fetch all conversations for current user
 */
export function useConversations(filters?: ConversationFilters) {
  return useQuery({
    queryKey: [...chatKeys.conversations(), filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      let query = supabase
        .from('conversations')
        .select(`
          *,
          personalities (
            id,
            slug,
            display_name,
            era,
            short_bio,
            speaking_style,
            values_pillars,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (filters?.personalityId) {
        query = query.eq('personality_id', filters.personalityId);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []) as ConversationWithPersonality[];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Fetch single conversation by ID
 */
export function useConversation(conversationId: string | undefined) {
  return useQuery({
    queryKey: chatKeys.conversation(conversationId || ''),
    queryFn: async () => {
      if (!conversationId) throw new Error('No conversation ID provided');

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          personalities (
            id,
            slug,
            display_name,
            era,
            short_bio,
            speaking_style,
            values_pillars,
            avatar_url
          )
        `)
        .eq('id', conversationId)
        .single();

      if (error) throw error;

      return data as ConversationWithPersonality;
    },
    enabled: !!conversationId && !conversationId.startsWith('guest-'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch messages for a conversation
 */
export function useConversationMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: chatKeys.messages(conversationId || ''),
    queryFn: async () => {
      if (!conversationId) throw new Error('No conversation ID provided');

      // Handle guest conversations
      if (conversationId.startsWith('guest-')) {
        const guestData = localStorage.getItem(`guest-conversation-${conversationId}`);
        if (guestData) {
          const parsed = JSON.parse(guestData);
          return (parsed.messages || []) as Message[];
        }
        return [];
      }

      // Regular authenticated conversations
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []) as Message[];
    },
    enabled: !!conversationId,
    staleTime: 10 * 1000, // 10 seconds
  });
}

// ============================================================================
// Conversation Mutations
// ============================================================================

/**
 * Create new conversation
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateConversationInput) => {
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
        .select(`
          *,
          personalities (
            id,
            slug,
            display_name,
            era,
            short_bio,
            speaking_style,
            values_pillars,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      return data as ConversationWithPersonality;
    },
    onSuccess: (data) => {
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
      
      // Set conversation cache
      queryClient.setQueryData(chatKeys.conversation(data.id), data);
      
      toast.success('Conversation created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create conversation');
    },
  });
}

/**
 * Update conversation (e.g., rename)
 */
export function useUpdateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateConversationInput) => {
      const { data, error } = await supabase
        .from('conversations')
        .update({ title: input.title })
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;

      return data as Conversation;
    },
    onSuccess: (data) => {
      // Update conversation cache
      queryClient.invalidateQueries({ queryKey: chatKeys.conversation(data.id) });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
      
      toast.success('Conversation updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update conversation');
    },
  });
}

/**
 * Delete conversation
 */
export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      // Handle guest conversations
      if (conversationId.startsWith('guest-')) {
        localStorage.removeItem(`guest-conversation-${conversationId}`);
        return { id: conversationId };
      }

      // Delete from database (cascade will delete messages)
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      return { id: conversationId };
    },
    onSuccess: (data) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: chatKeys.conversation(data.id) });
      queryClient.removeQueries({ queryKey: chatKeys.messages(data.id) });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
      
      toast.success('Conversation deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete conversation');
    },
  });
}

// ============================================================================
// Message Mutations
// ============================================================================

/**
 * Save message to database
 * Used after streaming completes to persist messages
 */
export function useSaveMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: Partial<Message> & { conversation_id: string }) => {
      // Handle guest conversations
      if (message.conversation_id.startsWith('guest-')) {
        const key = `guest-conversation-${message.conversation_id}`;
        const guestData = localStorage.getItem(key);
        
        if (guestData) {
          const parsed = JSON.parse(guestData);
          const newMessage: Message = {
            id: message.id || `msg-${Date.now()}`,
            conversation_id: message.conversation_id,
            role: message.role || 'user',
            content: message.content || '',
            created_at: new Date().toISOString(),
          };
          
          parsed.messages = [...(parsed.messages || []), newMessage];
          localStorage.setItem(key, JSON.stringify(parsed));
          
          return newMessage;
        }
        
        throw new Error('Guest conversation not found');
      }

      // Save to database
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: message.conversation_id,
            role: message.role || 'user',
            content: message.content || '',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return data as Message;
    },
    onSuccess: (data) => {
      // Invalidate messages for this conversation
      queryClient.invalidateQueries({ 
        queryKey: chatKeys.messages(data.conversation_id) 
      });
      
      // Update conversation's updated_at
      queryClient.invalidateQueries({ 
        queryKey: chatKeys.conversation(data.conversation_id) 
      });
    },
  });
}

// ============================================================================
// Optimistic Update Helpers
// ============================================================================

/**
 * Add optimistic message to cache
 */
export function useOptimisticMessage() {
  const queryClient = useQueryClient();

  return {
    addOptimistic: (conversationId: string, message: Message) => {
      queryClient.setQueryData<Message[]>(
        chatKeys.messages(conversationId),
        (old) => [...(old || []), message]
      );
    },
    
    removeOptimistic: (conversationId: string, messageId: string) => {
      queryClient.setQueryData<Message[]>(
        chatKeys.messages(conversationId),
        (old) => (old || []).filter((msg) => msg.id !== messageId)
      );
    },
    
    updateOptimistic: (conversationId: string, messageId: string, updates: Partial<Message>) => {
      queryClient.setQueryData<Message[]>(
        chatKeys.messages(conversationId),
        (old) =>
          (old || []).map((msg) =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          )
      );
    },
  };
}
