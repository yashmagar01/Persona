// ChatContainer.tsx
// Orchestrates Sidebar, Header, MessageList, and ChatInput with routing, state, and error boundary

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ErrorBoundary, InlineErrorBoundary } from '@/components/ErrorBoundary';
import ChatSidebar from '../Sidebar/ChatSidebar';
import { ChatHeader } from './ChatHeader';
import MessageList from '../MessageList/MessageList';
import ChatInput from '../ChatInput/ChatInput';
import { useActiveConversationId, useChatStore, useSidebarState, useConversationDraft } from '../../hooks/useChatStore';
import { useConversationMessages, useSaveMessage } from '../../hooks/useConversations';
import { createGuestConversation, getGuestConversation, updateGuestConversation } from '../../lib/chatService';
import type { ChatMessage, Message } from '../../types/chat.types';
import { toast } from '@/lib/toast.utils';

export interface ChatContainerProps {
  className?: string;
}

export function ChatContainer({ className }: ChatContainerProps) {
  const navigate = useNavigate();
  const { conversationId: routeConversationId } = useParams<{ conversationId?: string }>();

  const { toggle: toggleSidebar } = useSidebarState();
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const activeConversationId = useActiveConversationId();

  // Ensure store sync with URL
  useEffect(() => {
    if (routeConversationId && routeConversationId !== activeConversationId) {
      setActiveConversation(routeConversationId);
    }
  }, [routeConversationId, activeConversationId, setActiveConversation]);

  // Load messages for current conversation
  const { data: messages = [], isLoading } = useConversationMessages(routeConversationId);

  // Sending state when not using streaming hook
  const [isSending, setIsSending] = useState(false);

  // Save message helper
  const saveMessage = useSaveMessage();

  // Ensure guest conversation exists in localStorage (for saving)
  const ensureGuestConversation = useCallback((id: string) => {
    if (!id?.startsWith('guest-')) return;
    const exists = getGuestConversation(id);
    if (!exists) {
      // Create minimal guest record using College Sahayak stub personality
      const conv = {
        id,
        personality_id: 'default',
        display_name: 'College Sahayak',
        title: 'Chat with College Sahayak',
        created_at: new Date().toISOString(),
        messages: [],
      };
      localStorage.setItem(`guest-conversation-${id}`, JSON.stringify(conv));
    }
  }, []);

  const handleNewChat = useCallback(() => {
    // Create a guest conversation (id auto-generated)
    const guest = createGuestConversation('default', 'College Sahayak');
    setActiveConversation(guest.id);
    navigate(`/chat/${guest.id}`);
  }, [navigate, setActiveConversation]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!text?.trim()) return;
      try {
        setIsSending(true);

        let id = routeConversationId;
        if (!id) {
          // Create a new guest conversation on first send
          const guest = createGuestConversation('default', 'College Sahayak');
          id = guest.id;
          setActiveConversation(id);
          navigate(`/chat/${id}`);
        }

        if (!id) return;
        ensureGuestConversation(id);

        await saveMessage.mutateAsync({
          conversation_id: id,
          role: 'user',
          content: text.trim(),
        });
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message || 'Failed to send message');
        throw err;
      } finally {
        setIsSending(false);
      }
    },
    [navigate, routeConversationId, saveMessage, setActiveConversation, ensureGuestConversation]
  );

  const onRetry = useCallback(
    async (m: ChatMessage) => {
      try {
        await handleSend(m.content);
      } catch {}
    },
    [handleSend]
  );

  const onExampleClick = useCallback(
    async (text: string) => {
      await handleSend(text);
    },
    [handleSend]
  );

  // Keyboard shortcuts
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // Focus textarea
        const ta = containerRef.current?.querySelector('textarea');
        (ta as HTMLTextAreaElement | undefined)?.focus();
      }
      if (meta && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewChat();
      }
      if (meta && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        const id = routeConversationId;
        if (id?.startsWith('guest-')) {
          const conv = getGuestConversation(id);
          if (conv) {
            updateGuestConversation(id, [] as unknown as Message[]);
            toast('Conversation cleared');
          }
        } else {
          toast('Clear conversation is only implemented for guest chats right now');
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNewChat, routeConversationId]);

  return (
    <ErrorBoundary>
      <div ref={containerRef} className={cn('h-screen w-full flex overflow-hidden', className)}>
        {/* Sidebar - handles overlay on mobile internally */}
        <InlineErrorBoundary>
          <div className="hidden md:block">
            <ChatSidebar />
          </div>
        </InlineErrorBoundary>

        {/* Main column */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#212121]">
          <InlineErrorBoundary>
            <ChatHeader
              title="College Sahayak"
              onToggleSidebar={toggleSidebar}
              onNewChat={handleNewChat}
            />
          </InlineErrorBoundary>

          <div className="min-h-0 flex-1">
            <InlineErrorBoundary>
              <MessageList
                messages={messages as unknown as ChatMessage[]}
                assistantName="College Sahayak"
                isLoading={isLoading}
                onRetry={onRetry}
                onExampleClick={onExampleClick}
              />
            </InlineErrorBoundary>
          </div>

          <InlineErrorBoundary>
            <ChatInput
              conversationId={routeConversationId || 'new'}
              onSend={handleSend}
              onStop={() => { /* Wire to streaming hook later */ }}
              isGenerating={isSending}
            />
          </InlineErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default ChatContainer;
