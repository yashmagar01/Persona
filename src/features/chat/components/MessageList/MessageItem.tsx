// MessageItem.tsx
// Render a single chat message with ChatGPT-like styling, markdown, code highlighting, and actions

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast.utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle } from 'lucide-react';
import MessageActions from './MessageActions';
import { messageVariants, typingDotStyle, animationClasses } from '@/styles/animations';
import type { ChatMessage } from '@/features/chat/types/chat.types';
import { useIsMobile, useIsTouchDevice } from '@/hooks/use-responsive';
import { useLongPress } from '@/hooks/use-touch';

export interface MessageItemProps {
  message: ChatMessage;
  assistantAvatarUrl?: string | null;
  assistantName?: string;
  onRegenerate?: () => void;
  onRetry?: () => void;
  onDelete?: () => void;
}

const CodeBlock: React.FC<{ className?: string; children?: React.ReactNode } & { inline?: boolean }> = ({ className, children, inline }) => {
  const content = String(children ?? '');
  const [copied, setCopied] = useState(false);
  
  if (inline) {
    return (
      <code className={cn('px-1.5 py-0.5 rounded bg-[#2f2f2f] text-[#ececec] font-mono text-[13px]')}>{content}</code>
    );
  }

  const language = (className || '').replace(/language-/, '') || 'plaintext';
  const { value } = hljs.highlight(content, { language });
  const lines = value.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="my-3 overflow-hidden rounded-md bg-[#1e1e1e] border border-[rgba(77,77,77,0.2)] group relative">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[rgba(77,77,77,0.2)] bg-[#2a2a2a]">
        <span className="text-xs text-[#8e8e8e] font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="text-xs px-2 py-1 rounded hover:bg-[#3a3a3a] text-[#b4b4b4] hover:text-[#ececec] transition-colors flex items-center gap-1"
        >
          {copied ? (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="m-0 p-3 text-[13px] leading-6 overflow-x-auto">
        <code className="hljs block">
          {lines.map((line, idx) => (
            <div key={idx} className="grid grid-cols-[auto_1fr] gap-3">
              <span className="select-none text-[#6b7280] text-right w-8 pr-1">{idx + 1}</span>
              <span dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
};

const AssistantContent: React.FC<{ content: string }> = ({ content }) => {
  const components = useMemo(
    () => ({
      code: ({ className, inline, children }: any) => (
        <CodeBlock className={className} inline={inline}>
          {children}
        </CodeBlock>
      ),
      p: (props: any) => <p className="mb-3 leading-7 text-[14px] text-[#ececec]" {...props} />,
      strong: (props: any) => <strong className="font-semibold" {...props} />,
      em: (props: any) => <em className="italic" {...props} />,
      a: (props: any) => <a className="text-[#10a37f] hover:underline" target="_blank" rel="noreferrer" {...props} />,
      ul: (props: any) => <ul className="list-disc pl-6 mb-3 space-y-1" {...props} />,
      ol: (props: any) => <ol className="list-decimal pl-6 mb-3 space-y-1" {...props} />,
      li: (props: any) => <li className="text-[14px]" {...props} />,
      blockquote: (props: any) => <blockquote className="border-l-2 border-[#3f3f3f] pl-3 italic text-[#b4b4b4]" {...props} />,
      hr: () => <hr className="my-4 border-[rgba(77,77,77,0.2)]" />,
    }),
    []
  );

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={components}>
      {content}
    </ReactMarkdown>
  );
};

const TypingDots: React.FC = () => (
  <span className="flex items-end gap-1 pl-1">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className={cn('h-1.5 w-1.5 rounded-full bg-[#ececec]/70', animationClasses.typing.dot)}
        style={typingDotStyle(i, 100)}
      />
    ))}
  </span>
);

function RawMessageItem({ 
  message, 
  assistantAvatarUrl, 
  assistantName, 
  onRegenerate,
  onRetry,
  onDelete
}: MessageItemProps) {
  const role = message.role === 'system' ? 'assistant' : message.role;
  const isUser = role === 'user';
  const isAssistant = role === 'assistant';
  const hasError = message.status === 'error';

  const isMobile = useIsMobile();
  const isTouch = useIsTouchDevice();
  const [showMobileActions, setShowMobileActions] = useState(false);

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content || '').then(() => {
      toast.success('Copied!');
    });
  }, [message.content]);

  // Long press for mobile to show actions menu
  const longPressRef = useLongPress(() => {
    if (isTouch && !hasError) {
      setShowMobileActions(true);
      toast.info('Actions menu opened');
    }
  }, 500);

  // keyboard shortcut: C to copy when focused
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.key === 'c' || e.key === 'C') && (document.activeElement === el || el.contains(document.activeElement))) {
        e.preventDefault();
        onCopy();
      }
    };
    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  }, [onCopy]);

  // Combine refs for root element (keyboard + long press)
  const combinedRef = useCallback((node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (longPressRef.current !== node) {
      // @ts-ignore - TypeScript issue with ref assignment
      longPressRef.current = node;
    }
  }, []);

  return (
    <motion.div
      ref={combinedRef}
      role="article"
      aria-label={isUser ? 'User message' : 'Assistant message'}
      tabIndex={0}
      className={cn(
        'group w-full flex items-start outline-none focus-visible:ring-2 focus-visible:ring-[#10a37f] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(23,23,23)]',
        // Mobile: less padding, full-width
        isMobile ? 'gap-2 px-2 py-2' : 'gap-3 px-3 py-2',
        isUser ? 'justify-end' : ''
      )}
      variants={messageVariants.fadeInUp()}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {/* Assistant avatar left */}
      {isAssistant && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={assistantAvatarUrl || ''} alt={assistantName || 'Assistant'} />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
      )}

      {/* Bubble */}
      <div
        className={cn(
          'w-full',
          // Mobile: allow full width, desktop: max width
          isMobile ? 'max-w-full' : 'max-w-[800px]',
          isUser ? 'text-right' : 'text-left'
        )}
      >
        <div
          className={cn(
            'inline-block text-[14px] leading-7 rounded-[12px] relative',
            // Mobile: smaller padding
            isMobile ? 'px-3 py-2' : 'px-4 py-3',
            isUser
              ? 'bg-[#2f2f2f] text-[#ececec]'
              : 'bg-transparent text-[#ececec]',
            hasError && 'bg-destructive/10 border border-destructive/30'
          )}
        >
          {/* Error indicator */}
          {hasError && (
            <div className="flex items-center gap-2 mb-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Failed to send</span>
            </div>
          )}
          
          {isAssistant ? (
            message.status === 'pending' || message.status === 'streaming' ? (
              <TypingDots />
            ) : (
              <AssistantContent content={message.content} />
            )
          ) : (
            <span className="whitespace-pre-wrap break-words">{message.content}</span>
          )}
        </div>

        {/* Actions Row - always visible on mobile if error or menu open */}
        <div className={cn(
          'mt-1 flex',
          isUser ? 'justify-end' : 'justify-start',
          // Mobile: show actions if menu open or error
          isMobile && (showMobileActions || hasError) && 'opacity-100'
        )}>
          <MessageActions
            role={isUser ? 'user' : 'assistant'}
            onCopy={onCopy}
            onRegenerate={isAssistant ? onRegenerate : undefined}
            onRetry={hasError ? onRetry : undefined}
            onDelete={hasError ? onDelete : undefined}
            isMobile={isMobile}
            forceVisible={showMobileActions}
          />
        </div>
      </div>

      {/* User avatar right */}
      {isUser && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src="" alt="You" />
          <AvatarFallback>YOU</AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
}

export const MessageItem = memo(RawMessageItem);
export default MessageItem;
