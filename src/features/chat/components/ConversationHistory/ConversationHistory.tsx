// ConversationHistory.tsx
// Purpose: Full-page or panel for managing all conversations (rename/delete/open).
// TODO: Hook into useConversationData hooks and render list with actions.

import React from 'react';
import type { ConversationWithPersonality } from '@/features/chat/services/types';

export interface ConversationHistoryProps {
  conversations: ConversationWithPersonality[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export function ConversationHistory({ conversations, onOpen, onDelete, className }: ConversationHistoryProps) {
  return (
    <div className={className}>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {conversations.map((c) => (
          <div key={c.id} className="border rounded-md p-3 hover:shadow cursor-pointer" onClick={() => onOpen(c.id)}>
            <div className="font-medium truncate">{c.personalities.display_name}</div>
            {c.title && <div className="text-sm text-muted-foreground truncate">{c.title}</div>}
            <div className="flex justify-end">
              <button
                className="text-xs text-destructive hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(c.id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ConversationHistory;
