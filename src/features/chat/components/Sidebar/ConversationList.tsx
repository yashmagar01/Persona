// ConversationList.tsx
// Purpose: Scrollable list of conversations with click handlers.
// TODO: Hook up to TanStack Query data and navigation.

import React from 'react';
import { cn } from '@/lib/utils';
import type { ConversationWithPersonality as Conversation } from '@/features/chat/services/types';

export interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string | null;
  onSelect: (id: string) => void;
  className?: string;
}

export function ConversationList({ conversations, activeConversationId, onSelect, className }: ConversationListProps) {
  return (
    <div className={cn('flex flex-col gap-1 p-2', className)}>
      {conversations.map((c) => (
        <button
          key={c.id}
          className={cn(
            'text-left px-3 py-2 rounded hover:bg-accent transition-colors',
            c.id === activeConversationId && 'bg-accent'
          )}
          onClick={() => onSelect(c.id)}
        >
          <div className="font-medium truncate">{c.personalities?.display_name ?? c.title ?? 'Conversation'}</div>
          {c.title && <div className="text-xs text-muted-foreground truncate">{c.title}</div>}
        </button>
      ))}
    </div>
  );
}

export default ConversationList;
