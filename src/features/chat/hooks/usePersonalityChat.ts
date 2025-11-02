/**
 * Vercel AI SDK Integration Hook
 * Connects useChat from Vercel AI SDK with Supabase backend
 */

import { useChat, type Message as AIMessage } from 'ai/react';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import type { ChatMessage, DbPersonality } from '../types/chat.types';
import { useChatStore } from './useChatStore';
import { useConversationMessages, useSaveMessage } from './useConversations';

interface UsePersonalityChatOptions {
  conversationId: string;
  personality: DbPersonality;
  onFinish?: (message: AIMessage) => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook that wraps Vercel AI SDK's useChat with our backend
 * Handles streaming, optimistic updates, and persistence to Supabase
 */
export function usePersonalityChat({
  conversationId,
  personality,
  onFinish,
  onError,
}: UsePersonalityChatOptions) {
  const { setStreaming } = useChatStore();
  const saveMessage = useSaveMessage();
  
  // Fetch existing messages from database
  const { data: dbMessages = [], isLoading: isLoadingMessages } = useConversationMessages(conversationId);

  // Check if guest mode
  const isGuestMode = conversationId.startsWith('guest-');

  // Convert DB messages to AI SDK format
  const initialMessages: AIMessage[] = useMemo(() => {
    return dbMessages.map((msg) => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      createdAt: new Date(msg.created_at),
    }));
  }, [dbMessages]);

  // Vercel AI SDK useChat hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    reload,
    setMessages,
  } = useChat({
    api: '/api/chat', // We'll create this endpoint
    id: conversationId,
    initialMessages,
    body: {
      conversationId,
      personalityId: personality.id,
      isGuestMode,
      personality: {
        display_name: personality.display_name,
        speaking_style: personality.speaking_style,
        values_pillars: personality.values_pillars,
        short_bio: personality.short_bio,
        era: personality.era,
      },
    },
    onFinish: async (message) => {
      // Save assistant message to database after streaming completes
      try {
        await saveMessage.mutateAsync({
          conversation_id: conversationId,
          role: 'assistant',
          content: message.content,
          created_at: new Date().toISOString(),
        });

        setStreaming(false, null);
        onFinish?.(message);
      } catch (err) {
        console.error('Failed to save assistant message:', err);
        toast.error('Message sent but failed to save');
      }
    },
    onError: (err) => {
      setStreaming(false, null);
      
      const errorMessage = err.message || 'Failed to send message';
      
      // Handle specific errors
      if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        toast.error('Too many requests. Please wait a moment and try again.', {
          duration: 5000,
        });
      } else if (errorMessage.includes('quota') || errorMessage.includes('403')) {
        toast.error('API quota exceeded. Please try again later.');
      } else {
        toast.error(errorMessage);
      }
      
      onError?.(err);
    },
    onResponse: (response) => {
      // Stream started
      if (response.ok) {
        setStreaming(true, 'streaming');
      }
    },
  });

  // Custom submit handler that saves user message first
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();

    try {
      // Save user message to database before streaming
      const savedUserMessage = await saveMessage.mutateAsync({
        conversation_id: conversationId,
        role: 'user',
        content: userMessage,
        created_at: new Date().toISOString(),
      });

      // Now trigger AI response (useChat will handle optimistic updates)
      handleSubmit(e);
      
    } catch (err) {
      console.error('Failed to save user message:', err);
      toast.error('Failed to send message');
    }
  };

  // Sync streaming state
  useEffect(() => {
    if (isLoading) {
      setStreaming(true, 'streaming');
    } else {
      setStreaming(false, null);
    }
  }, [isLoading, setStreaming]);

  // Convert messages to our ChatMessage type
  const chatMessages: ChatMessage[] = useMemo(() => {
    return messages.map((msg) => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      created_at: msg.createdAt?.toISOString() || new Date().toISOString(),
      createdAt: msg.createdAt,
      conversation_id: conversationId,
      status: isLoading && msg.role === 'assistant' ? 'streaming' : 'sent',
    }));
  }, [messages, conversationId, isLoading]);

  return {
    messages: chatMessages,
    input,
    handleInputChange,
    handleSubmit: handleCustomSubmit,
    isLoading: isLoading || isLoadingMessages,
    error,
    stop,
    reload,
    setMessages,
  };
}

/**
 * Alternative hook for simpler use cases
 * Uses the Edge Function endpoint directly
 */
export function usePersonalityChatSimple({
  conversationId,
  personality,
}: Omit<UsePersonalityChatOptions, 'onFinish' | 'onError'>) {
  const isGuestMode = conversationId.startsWith('guest-');
  const { data: dbMessages = [] } = useConversationMessages(conversationId);

  const initialMessages: AIMessage[] = useMemo(() => {
    return dbMessages.map((msg) => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      createdAt: new Date(msg.created_at),
    }));
  }, [dbMessages]);

  return useChat({
    api: '/api/chat',
    id: conversationId,
    initialMessages,
    body: {
      conversationId,
      personalityId: personality.id,
      isGuestMode,
      personality,
    },
  });
}
