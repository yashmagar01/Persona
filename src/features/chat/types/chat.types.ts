/**
 * Chat Feature Type Definitions
 * Types for messages, conversations, and UI state
 */

import { Message as AIMessage } from 'ai';

// ============================================================================
// Database Types (from Supabase)
// ============================================================================

export interface DbMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface DbConversation {
  id: string;
  user_id: string;
  personality_id: string;
  title: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DbPersonality {
  id: string;
  slug: string;
  display_name: string;
  era: string;
  short_bio: string;
  speaking_style: string;
  values_pillars: string[];
  avatar_url: string | null;
}

// ============================================================================
// Application Types (with relationships)
// ============================================================================

export interface Message extends DbMessage {
  status?: 'pending' | 'sent' | 'error' | 'streaming';
}

export interface Conversation extends DbConversation {
  personalities?: DbPersonality;
  last_message_at?: string;
  message_count?: number;
}

export interface ConversationWithPersonality extends DbConversation {
  personalities: DbPersonality;
}

// ============================================================================
// Vercel AI SDK Integration Types
// ============================================================================

/**
 * Enhanced message type that works with both Vercel AI SDK and Supabase
 * Vercel AI SDK uses: { id, role, content, createdAt }
 * Supabase uses: { id, role, content, created_at, conversation_id }
 */
export interface ChatMessage extends AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
  created_at?: string;
  conversation_id?: string;
  status?: 'pending' | 'sent' | 'error' | 'streaming';
}

/**
 * Options for useChat hook
 */
export interface UseChatOptions {
  conversationId: string;
  personalityId: string;
  initialMessages?: ChatMessage[];
  onSuccess?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
}

/**
 * API request body for chat endpoint
 */
export interface ChatRequestBody {
  conversationId: string;
  personalityId: string;
  messages: ChatMessage[];
  isGuestMode?: boolean;
  personality: DbPersonality;
}

/**
 * API response for streaming
 */
export interface ChatStreamResponse {
  content: string;
  done: boolean;
  messageId?: string;
}

// ============================================================================
// Guest Mode Types
// ============================================================================

export interface GuestConversation {
  id: string; // Format: 'guest-{personalityId}-{timestamp}'
  personality_id: string;
  display_name: string;
  title: string;
  created_at: string;
  messages: Message[];
}

export interface GuestConversationStorage {
  [conversationId: string]: GuestConversation;
}

// ============================================================================
// UI State Types (for Zustand)
// ============================================================================

export interface UIState {
  // Sidebar state
  isSidebarOpen: boolean;
  sidebarWidth: number;
  
  // Active conversation
  activeConversationId: string | null;
  
  // Draft messages per conversation
  drafts: Record<string, string>;
  
  // UI preferences
  theme: 'light' | 'dark' | 'system';
  
  // Streaming state
  isStreaming: boolean;
  streamingMessageId: string | null;
}

export interface UIActions {
  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarWidth: (width: number) => void;
  
  // Conversation actions
  setActiveConversation: (id: string | null) => void;
  
  // Draft actions
  setDraft: (conversationId: string, text: string) => void;
  getDraft: (conversationId: string) => string;
  clearDraft: (conversationId: string) => void;
  
  // Theme actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Streaming actions
  setStreaming: (isStreaming: boolean, messageId?: string | null) => void;
  
  // Reset
  reset: () => void;
}

export type ChatStore = UIState & UIActions;

// ============================================================================
// Component Props Types
// ============================================================================

export interface ChatContainerProps {
  conversationId?: string;
  className?: string;
}

export interface MessageListProps {
  messages: ChatMessage[];
  personality?: DbPersonality;
  isLoading?: boolean;
  className?: string;
}

export interface MessageItemProps {
  message: ChatMessage;
  personality?: DbPersonality;
  onCopy?: (content: string) => void;
  onRegenerate?: () => void;
  className?: string;
}

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onStop?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export interface ConversationListItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  className?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Create conversation input
 */
export interface CreateConversationInput {
  personalityId: string;
  title?: string;
  userId?: string;
}

/**
 * Update conversation input
 */
export interface UpdateConversationInput {
  id: string;
  title?: string;
}

// Service-level types for sending/streaming
export interface SendResult {
  messageId: string;
  content: string;
}

export interface RetryMessageInput {
  conversationId: string;
  messageId: string;
}

/**
 * Send message input
 */
export interface SendMessageInput {
  conversationId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
}

/**
 * Query filters
 */
export interface ConversationFilters {
  userId?: string;
  personalityId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Error types
 */
export interface ChatError extends Error {
  code?: string;
  statusCode?: number;
  details?: unknown;
}
