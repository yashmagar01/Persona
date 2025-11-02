// services/types.ts
// Purpose: Public types for the chat feature. Re-exports internal types to avoid duplication.

export type {
  DbMessage as Message,
  DbConversation as Conversation,
  DbPersonality as Personality,
  ConversationWithPersonality,
  ChatMessage,
  CreateConversationInput,
  UpdateConversationInput,
  ConversationFilters,
} from '../types/chat.types';
