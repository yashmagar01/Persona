/**
 * ChatPage - Example implementation using Vercel AI SDK
 * This demonstrates how to use the new hooks and components
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Loader2, StopCircle } from 'lucide-react';
import { Message, MessageAvatar, MessageContent } from '@/components/ui/message';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ui/conversation';
import { Response } from '@/components/ui/response';
import { useChatStore } from '@/features/chat/hooks/useChatStore';
import { useConversation } from '@/features/chat/hooks/useConversations';
import { usePersonalityChat } from '@/features/chat/hooks/usePersonalityChat';

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { setActiveConversation } = useChatStore();

  // Fetch conversation details
  const { data: conversation, isLoading: isLoadingConversation } = useConversation(conversationId);

  // Set active conversation in store
  useEffect(() => {
    if (conversationId) {
      setActiveConversation(conversationId);
    }
  }, [conversationId, setActiveConversation]);

  // Chat functionality with Vercel AI SDK
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
  } = usePersonalityChat({
    conversationId: conversationId!,
    personality: conversation?.personalities!,
    onFinish: (message) => {
      console.log('Message finished:', message);
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  // Loading state
  if (isLoadingConversation || !conversation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  const personality = conversation.personalities;
  const isGuestMode = conversationId?.startsWith('guest-');

  return (
    <div className="h-screen bg-gradient-to-br from-background to-muted flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm flex-shrink-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/chatboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent overflow-hidden flex-shrink-0">
                {personality.avatar_url ? (
                  <img
                    src={personality.avatar_url}
                    alt={personality.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    👤
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-xl font-bold text-foreground">
                  {personality.display_name}
                </h1>
                <p className="text-sm text-muted-foreground">{personality.era}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Guest User Banner */}
      {isGuestMode && (
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border flex-shrink-0">
          <div className="container mx-auto px-4 py-3 max-w-4xl">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-foreground">
                ✨ You're chatting as a <span className="font-semibold">guest</span>.
                Sign up to save your conversations!
              </p>
              <Button size="sm" onClick={() => navigate('/auth')} className="shrink-0">
                Sign Up Free
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 relative bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <Conversation className="h-full">
          <ConversationContent className="container mx-auto px-4 py-6 max-w-4xl">
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<div className="text-6xl">👋</div>}
                title={`Welcome to your conversation with ${personality.display_name}!`}
                description="Start by asking a question or sharing your thoughts!"
              >
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground italic">
                    💡 Tip: Try asking about my life experiences, values, or era
                  </p>
                </div>
              </ConversationEmptyState>
            ) : (
              <div className="space-y-2">
                {messages.map((message) => {
                  const messageRole = message.role === 'system' ? 'assistant' : message.role;

                  return (
                    <Message key={message.id} from={messageRole}>
                      {messageRole === 'assistant' && (
                        <MessageAvatar
                          src={personality.avatar_url || ''}
                          name={personality.display_name}
                        />
                      )}
                      <MessageContent>
                        <Response className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                          {message.content}
                        </Response>
                        <p className="text-xs mt-1.5 opacity-80 font-normal">
                          {message.createdAt
                            ? new Date(message.createdAt).toLocaleTimeString()
                            : new Date(message.created_at!).toLocaleTimeString()}
                        </p>
                      </MessageContent>
                      {messageRole === 'user' && <MessageAvatar src="" name="You" />}
                    </Message>
                  );
                })}

                {/* Streaming Indicator */}
                {isLoading && (
                  <Message from="assistant">
                    <MessageAvatar
                      src={personality.avatar_url || ''}
                      name={personality.display_name}
                    />
                    <MessageContent>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {personality.display_name} is typing
                        </span>
                        <div className="flex gap-1">
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          ></div>
                        </div>
                      </div>
                    </MessageContent>
                  </Message>
                )}
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      {/* Input Area */}
      <div className="bg-card border-t border-border flex-shrink-0 sticky bottom-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 py-3 sm:py-4 max-w-4xl">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => handleInputChange(e)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 h-10 sm:h-auto"
              autoComplete="off"
              onKeyDown={(e) => {
                // Enter to send, Shift+Enter for newline
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            {isLoading ? (
              <Button
                type="button"
                onClick={stop}
                size="icon"
                variant="destructive"
                className="h-10 w-10 sm:h-auto sm:w-auto sm:px-4"
              >
                <StopCircle className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                size="icon"
                className="h-10 w-10 sm:h-auto sm:w-auto sm:px-4"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
