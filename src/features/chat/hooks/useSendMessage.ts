// useSendMessage.ts
// Complete streaming message hook with optimistic updates, abort control, and error recovery

import { useCallback, useState } from 'react';
import { toast, commonToasts } from '@/lib/toast.utils';
import { logError } from '@/lib/errorLogger';
import { useQueryClient } from '@tanstack/react-query';
import { useSaveMessage, useOptimisticMessage, chatKeys } from './useConversations';
import { sendMessage as apiSendMessage } from '../services/chatService';
import { useChatStore } from './useChatStore';
import type { Message, ChatMessage } from '../types/chat.types';

export interface UseSendMessageOptions {
  conversationId: string;
  personalityId?: string;
  onMessageSent?: (message: ChatMessage) => void;
}

export interface UseSendMessageReturn {
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  retryMessage: (messageId: string) => Promise<void>;
}

/**
 * Hook for sending messages with streaming, optimistic updates, and error recovery
 * 
 * Features:
 * - Optimistic user message with "pending" status
 * - Real-time streaming with chunk aggregation
 * - Abort control via store.abortController
 * - Error recovery with retry
 * - Auto-persist after completion
 */
export function useSendMessage({
  conversationId,
  personalityId = 'default',
  onMessageSent,
}: UseSendMessageOptions): UseSendMessageReturn {
  const queryClient = useQueryClient();
  const saveMessage = useSaveMessage();
  const { addOptimistic, updateOptimistic, removeOptimistic } = useOptimisticMessage();
  
  const { beginSending, endSending, setAbortController, clearDraft } = useChatStore((s) => ({
    beginSending: s.beginSending,
    endSending: s.endSending,
    setAbortController: s.setAbortController,
    clearDraft: s.clearDraft,
  }));

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [failedMessages, setFailedMessages] = useState<Map<string, string>>(new Map());

  const send = useCallback(
    async (content: string) => {
      if (!content?.trim()) return;
      
      const userMessageId = `temp-user-${Date.now()}`;
      const assistantMessageId = `temp-assistant-${Date.now()}`;

      try {
        setIsLoading(true);
        setError(null);
        beginSending();

        // 1) Optimistic user message
        const userMessage: Message = {
          id: userMessageId,
          conversation_id: conversationId,
          role: 'user',
          content: content.trim(),
          created_at: new Date().toISOString(),
          status: 'pending',
        };
        addOptimistic(conversationId, userMessage);

        // 2) Save user message to DB/localStorage
        const savedUser = await saveMessage.mutateAsync({
          conversation_id: conversationId,
          role: 'user',
          content: content.trim(),
        });

        // Replace temp with real ID
        removeOptimistic(conversationId, userMessageId);
        addOptimistic(conversationId, { ...savedUser, status: 'sent' } as Message);

        // 3) Add assistant placeholder (streaming)
        const assistantMessage: Message = {
          id: assistantMessageId,
          conversation_id: conversationId,
          role: 'assistant',
          content: '',
          created_at: new Date().toISOString(),
          status: 'streaming',
        };
        addOptimistic(conversationId, assistantMessage);

        // 4) Start streaming
        let accumulatedContent = '';
        const { abortController, done } = await apiSendMessage({
          conversationId,
          personalityId,
          content: content.trim(),
          onToken: (chunk) => {
            accumulatedContent += chunk;
            updateOptimistic(conversationId, assistantMessageId, {
              content: accumulatedContent,
              status: 'streaming',
            });
          },
        });

        setAbortController(abortController);

        // 5) Wait for stream completion
        const result = await done;

        // Handle abort case
        if (result.messageId === 'aborted') {
          updateOptimistic(conversationId, assistantMessageId, {
            content: accumulatedContent,
            status: 'error',
          });
          commonToasts.messageStopped();
          setAbortController(null);
          endSending();
          setIsLoading(false);
          return;
        }

        // 6) Persist assistant message
        const savedAssistant = await saveMessage.mutateAsync({
          conversation_id: conversationId,
          role: 'assistant',
          content: result.content || accumulatedContent,
        });

        // Replace temp assistant with real
        removeOptimistic(conversationId, assistantMessageId);
        addOptimistic(conversationId, { ...savedAssistant, status: 'sent' } as Message);

        // 7) Cleanup
        clearDraft(conversationId);
        setAbortController(null);
        queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
        
        onMessageSent?.({
          ...savedAssistant,
          status: 'sent',
        } as unknown as ChatMessage);

        commonToasts.messageSent();

      } catch (err: any) {
        logError('Send message error', err, {
          component: 'useSendMessage',
          action: 'send',
          conversationId,
        });
        
        // Mark assistant message as error if it was added
        if (queryClient.getQueryData(chatKeys.messages(conversationId))) {
          updateOptimistic(conversationId, assistantMessageId, {
            status: 'error',
          });
        }

        setError(err);
        setFailedMessages((prev) => new Map(prev).set(assistantMessageId, content.trim()));

        // Show error toast
        if (err.name === 'AbortError') {
          commonToasts.messageStopped();
        } else if (err.message?.includes('rate limit')) {
          commonToasts.rateLimited();
        } else if (err.message?.includes('quota')) {
          toast.error('API quota exceeded', 'Please try again later');
        } else {
          commonToasts.messageFailed();
        }
      } finally {
        setIsLoading(false);
        endSending();
        setAbortController(null);
      }
    },
    [
      conversationId,
      personalityId,
      saveMessage,
      addOptimistic,
      updateOptimistic,
      removeOptimistic,
      beginSending,
      endSending,
      setAbortController,
      clearDraft,
      queryClient,
      onMessageSent,
    ]
  );

  const retry = useCallback(
    async (messageId: string) => {
      const originalContent = failedMessages.get(messageId);
      if (!originalContent) {
        toast.error('Cannot retry: original message not found');
        return;
      }

      // Remove failed message
      removeOptimistic(conversationId, messageId);
      setFailedMessages((prev) => {
        const next = new Map(prev);
        next.delete(messageId);
        return next;
      });

      // Resend
      await send(originalContent);
    },
    [conversationId, failedMessages, removeOptimistic, send]
  );

  return {
    sendMessage: send,
    isLoading,
    error,
    retryMessage: retry,
  };
}

export default useSendMessage;
