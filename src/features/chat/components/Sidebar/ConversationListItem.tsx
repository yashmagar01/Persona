// ConversationListItem.tsx
// Purpose: Render a single conversation entry with actions (context menu, delete).
// TODO: Add context menu (rename/delete) and keyboard interactions.

import React from 'react';
import { cn } from '@/lib/utils';
import type { ConversationWithPersonality as Conversation } from '@/features/chat/services/types';

export interface ConversationListItemProps {
  conversation: Conversation;
  active?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function ConversationListItem({ conversation, active, onClick, onDelete, className }: ConversationListItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className={cn(
        'px-3 py-2 rounded cursor-pointer select-none outline-none hover:bg-accent',
        active && 'bg-accent',
        className
      )}
    >
      <div className="font-medium truncate">{conversation.personalities?.display_name ?? conversation.title ?? 'Conversation'}</div>
      {conversation.title && <div className="text-xs text-muted-foreground truncate">{conversation.title}</div>}
      {/* TODO: Right-click / context menu for delete/rename */}
    </div>
  );
}

export default ConversationListItem;
