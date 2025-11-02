// ChatInput.tsx
// Full-featured chat input with autosize, keyboard shortcuts, animations, and draft persistence

import React, { useCallback, useMemo, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Paperclip, Send, Square, Loader2, WifiOff } from 'lucide-react';
import { toast } from '@/lib/toast.utils';
import { cn } from '@/lib/utils';
import { animationClasses } from '@/styles/animations';
import { useConversationDraft } from '@/features/chat/hooks/useChatStore';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { useIsMobile } from '@/hooks/use-responsive';

export interface ChatInputProps {
  conversationId: string;
  onSend: (text: string) => Promise<void> | void;
  onStop?: () => void;
  isGenerating?: boolean; // streaming/sending state from parent (optional)
  placeholder?: string;
  className?: string;
}

export function ChatInput({
  conversationId,
  onSend,
  onStop,
  isGenerating,
  placeholder = 'Message College Sahayak…',
  className,
}: ChatInputProps) {
  // Draft persistence via Zustand store
  const { draft, setDraft, clearDraft } = useConversationDraft(conversationId);

  // Network status monitoring
  const { isOnline } = useNetworkStatus();

  // Responsive detection
  const isMobile = useIsMobile();

  // Local focus and sending state
  const [focused, setFocused] = useState(false);
  const [internalSending, setInternalSending] = useState(false);
  const sending = isGenerating ?? internalSending;

  const text = draft ?? '';
  const setText = setDraft;

  const charCount = text.length;
  const approxTokens = useMemo(() => Math.max(1, Math.ceil(charCount / 4)), [charCount]);
  const countId = `chat-input-count-${conversationId}`;

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const canSend = !sending && focused && text.trim().length > 0 && isOnline;

  const handleSend = useCallback(async () => {
    if (!canSend) return;
    const payload = text;
    try {
      setInternalSending(true);
      await onSend(payload);
      clearDraft();
    } catch (err: any) {
      toast.error?.(err?.message || 'Failed to send message');
    } finally {
      setInternalSending(false);
      // keep focus after send for fast follow-ups
      textareaRef.current?.focus();
    }
  }, [canSend, text, onSend, clearDraft]);

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter') {
      const meta = e.metaKey || e.ctrlKey;
      if (!e.shiftKey && (meta || true)) {
        // Enter to send; Shift+Enter for newline; Ctrl/Cmd+Enter alternative
        if (!e.shiftKey || meta) {
          e.preventDefault();
          handleSend();
          return;
        }
      }
    }
    if (e.key === 'Escape') {
      (e.currentTarget as HTMLTextAreaElement).blur();
    }
  };

  return (
    <div
      className={cn(
        'sticky bottom-0 left-0 right-0 w-full',
        'bg-[#212121] border-t border-[rgba(77,77,77,0.2)]',
        'px-3 py-3 md:px-4 md:py-4',
        // Mobile: add safe area inset for devices with notch/home indicator
        isMobile && 'pb-safe',
        className
      )}
    >
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2">
          {/* Left actions */}
          <button
            type="button"
            aria-label="Attach file"
            className={cn(
              'hidden sm:inline-flex items-center justify-center touch-target rounded-md',
              'text-[#b4b4b4] hover:text-[#ececec] hover:bg-[#3f3f3f] focus:outline-none focus:ring-2 focus:ring-[#10a37f]'
            )}
            title="Attach file (coming soon)"
            disabled
          >
            <Paperclip size={16} />
          </button>

          {/* Textarea */}
          <div className="relative flex-1">
            <TextareaAutosize
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              aria-describedby={countId}
              className={cn(
                'w-full resize-none outline-none font-inherit',
                'bg-[#2f2f2f] text-[#ececec] placeholder:text-[#b4b4b4]',
                'px-4 py-3 rounded-[12px] border border-transparent',
                'transition-all duration-150 ease-in-out',
                'focus:border-[#10a37f] focus:shadow-[0_0_0_3px_rgba(16,163,127,0.10)]'
              )}
              minRows={1}
              maxRows={5}
            />

            {/* Character/Token count or offline indicator */}
            {!isOnline ? (
              <div className="mt-1 flex items-center gap-1.5 text-[12px] text-destructive select-none">
                <WifiOff className="h-3 w-3" />
                <span>You're offline</span>
              </div>
            ) : (focused || text.length > 0) && (
              <div id={countId} className="mt-1 text-[12px] text-[#b4b4b4] select-none">
                {charCount} characters • ~{approxTokens} tokens
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {sending ? (
              <button
                type="button"
                aria-label="Stop generating"
                className={cn(
                  'inline-flex items-center justify-center touch-target rounded-full bg-[#10a37f] text-white',
                  'hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10a37f] focus:ring-offset-[#212121]'
                )}
                onClick={onStop}
              >
                <Square size={16} />
              </button>
            ) : (
              <button
                type="button"
                aria-label={isOnline ? "Send message" : "Cannot send while offline"}
                className={cn(
                  'inline-flex items-center justify-center touch-target rounded-full bg-[#10a37f] text-white',
                  'hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10a37f] focus:ring-offset-[#212121]',
                  (!canSend || !isOnline) && 'opacity-50 cursor-not-allowed'
                )}
                onClick={handleSend}
                disabled={!canSend || !isOnline}
              >
                <Send size={16} className={cn(text.trim() && isOnline && animationClasses.loading.pulse)} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
