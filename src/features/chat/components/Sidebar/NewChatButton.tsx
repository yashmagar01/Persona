// NewChatButton.tsx
// Purpose: Dedicated button to create a new conversation (guest or authenticated).
// TODO: Wire to mutation and navigation logic.

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export interface NewChatButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

export function NewChatButton({ onClick, disabled }: NewChatButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled} className="w-full" size="sm">
      <Plus className="h-4 w-4 mr-2" /> New Chat
    </Button>
  );
}

export default NewChatButton;
