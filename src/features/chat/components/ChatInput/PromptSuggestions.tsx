// PromptSuggestions.tsx
// Purpose: Quick suggestion chips to accelerate user prompts.
// TODO: Provide suggestions based on conversation/personality context.

import React from 'react';
import { Button } from '@/components/ui/button';

export interface PromptSuggestionsProps {
  suggestions: string[];
  onSelect: (text: string) => void;
  className?: string;
}

export function PromptSuggestions({ suggestions, onSelect, className }: PromptSuggestionsProps) {
  if (!suggestions?.length) return null;
  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, i) => (
          <Button key={`${s}-${i}`} size="sm" variant="secondary" onClick={() => onSelect(s)}>
            {s}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default PromptSuggestions;
