// MessageList.tsx
// Main scrollable message container with animations, empty/loading states, and scroll-to-bottom

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { messageVariants } from '@/styles/animations';
import MessageItem from './MessageItem';
import { MessageSkeletonList } from './MessageSkeleton';
import type { ChatMessage } from '@/features/chat/types/chat.types';

export interface MessageListProps {
  messages: ChatMessage[];
  assistantAvatarUrl?: string | null;
  assistantName?: string;
  isLoading?: boolean;
  onRetry?: (message: ChatMessage) => void;
  onExampleClick?: (text: string) => void; // fill input + auto-send
  className?: string;
}

// Simple stick-to-bottom logic with smooth scrolling
function useAutoScroll(containerRef: React.RefObject<HTMLDivElement>, dep: any) {
  const [atBottom, setAtBottom] = useState(true);

  // Track scroll position
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
      setAtBottom(nearBottom);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [containerRef]);

  // Auto scroll when new content arrives and user is near bottom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (atBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep]);

  const scrollToBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [containerRef]);

  return { atBottom, scrollToBottom };
}

export function MessageList({
  messages,
  assistantAvatarUrl,
  assistantName = 'College Sahayak',
  isLoading,
  onRetry,
  onExampleClick,
  className,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { atBottom, scrollToBottom } = useAutoScroll(scrollRef, messages.length);

  // Compute spacing between messages: 16px default, 32px when role switches
  const items = useMemo(() => {
    const out: Array<{ m: ChatMessage; gapTop: number }> = [];
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      const prev = messages[i - 1];
      const role = m.role === 'system' ? 'assistant' : m.role;
      const prevRole = prev ? (prev.role === 'system' ? 'assistant' : prev.role) : null;
      const gapTop = i === 0 ? 0 : role !== prevRole ? 32 : 16;
      out.push({ m, gapTop });
    }
    return out;
  }, [messages]);

  const examples = [
    'What are the best study techniques?',
    'Help me understand recursion',
    'Create a study schedule for me',
    'Tips to stay focused during exams',
  ];

  const empty = !isLoading && messages.length === 0;

  return (
    <div className={cn('h-full relative', className)}>
      {/* Scrollable area */}
      <div
        ref={scrollRef}
        className={cn(
          'h-full w-full overflow-y-auto',
          'px-4 md:px-6',
          'pt-4 pb-8' // top 16px, bottom 32px
        )}
        aria-live="polite"
      >
        {/* Empty state */}
        {empty && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center text-[#ececec]">
            <h2 className="text-xl font-semibold mb-2">Hey there! 👋</h2>
            <p className="text-[#b4b4b4] mb-4">I'm {assistantName}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full">
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => onExampleClick?.(ex)}
                  className={cn(
                    'text-left rounded-md px-4 py-3',
                    'bg-[#2f2f2f] text-[#ececec] hover:bg-[#3f3f3f] transition-colors'
                  )}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading state skeletons */}
        {isLoading && <MessageSkeletonList count={4} />}

        {/* Messages */}
        {!empty && (
          <motion.div variants={messageVariants.staggerContainer()} initial="hidden" animate="visible">
            {items.map(({ m, gapTop }) => (
              <div key={m.id} style={{ marginTop: gapTop }}>
                <MessageItem
                  message={m}
                  assistantAvatarUrl={assistantAvatarUrl || undefined}
                  assistantName={assistantName}
                  onRegenerate={undefined}
                  onRetry={m.status === 'error' ? () => onRetry?.(m) : undefined}
                  onDelete={m.status === 'error' ? () => {
                    // TODO: Implement delete handler in ChatContainer
                    console.log('Delete message:', m.id);
                  } : undefined}
                />
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Scroll to bottom button */}
      {!atBottom && !empty && (
        <button
          aria-label="Scroll to bottom"
          onClick={scrollToBottom}
          className={cn(
            'absolute right-4 bottom-4 md:right-6 md:bottom-6',
            'inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#10a37f] text-white shadow-lg',
            'hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10a37f] focus:ring-offset-[#212121]'
          )}
        >
          <ArrowDown size={18} />
        </button>
      )}

      {/* TODO: Virtualization with react-virtuoso when messages > 100 */}
    </div>
  );
}

export default MessageList;
