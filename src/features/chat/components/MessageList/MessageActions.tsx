// MessageActions.tsx
// Action buttons row for a message: Copy, Regenerate (assistant only), Like/Dislike (optional)

import React from 'react';
import { Copy, RefreshCw, ThumbsUp, ThumbsDown, RotateCcw, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface MessageActionsProps {
  role: 'user' | 'assistant';
  onCopy?: () => void;
  onRegenerate?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  onRetry?: () => void;
  onDelete?: () => void;
  isMobile?: boolean;
  forceVisible?: boolean;
  className?: string;
}

const iconBtn =
  'inline-flex items-center justify-center touch-target rounded-md text-[#b4b4b4] hover:text-[#ececec] hover:bg-[#3f3f3f] focus:outline-none focus:ring-2 focus:ring-[#10a37f] transition-opacity duration-150';

export function MessageActions({ 
  role, 
  onCopy, 
  onRegenerate, 
  onLike, 
  onDislike, 
  onRetry,
  onDelete,
  isMobile = false,
  forceVisible = false,
  className 
}: MessageActionsProps) {
  // Show error actions (Retry/Delete) if provided
  const hasErrorActions = onRetry || onDelete;
  
  return (
    <TooltipProvider>
      <div className={cn(
        'flex gap-1',
        // Mobile: stack vertically if needed, otherwise horizontal
        isMobile ? 'flex-wrap' : 'items-center',
        // Visibility: always show if error, force visible, or hover (desktop)
        hasErrorActions || forceVisible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        className
      )}>
        {/* Error state actions - always visible */}
        {onRetry && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                aria-label="Retry message" 
                className={cn(iconBtn, 'text-orange-500 hover:text-orange-400 hover:bg-orange-500/10')} 
                onClick={onRetry}
              >
                <RotateCcw size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Retry</TooltipContent>
          </Tooltip>
        )}

        {onDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                aria-label="Delete message" 
                className={cn(iconBtn, 'text-destructive hover:text-destructive/80 hover:bg-destructive/10')} 
                onClick={onDelete}
              >
                <Trash2 size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        )}

        {/* Normal actions - show on hover if no error */}
        {!hasErrorActions && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <button aria-label="Copy message" className={iconBtn} onClick={onCopy}>
                  <Copy size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Copy</TooltipContent>
            </Tooltip>

            {role === 'assistant' && onRegenerate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button aria-label="Regenerate response" className={iconBtn} onClick={onRegenerate}>
                    <RefreshCw size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Regenerate</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <button aria-label="Like message" className={iconBtn} onClick={onLike}>
                  <ThumbsUp size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Like</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button aria-label="Dislike message" className={iconBtn} onClick={onDislike}>
                  <ThumbsDown size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Dislike</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}

export default MessageActions;
