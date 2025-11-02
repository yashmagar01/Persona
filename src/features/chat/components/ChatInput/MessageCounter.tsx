// MessageCounter.tsx
// Purpose: Character/word counter for the input box.
// TODO: Wire to input value and optionally enforce limits.

import React from 'react';

export interface MessageCounterProps {
  value: string;
  maxChars?: number;
  className?: string;
}

export function MessageCounter({ value, maxChars, className }: MessageCounterProps) {
  const count = value?.length ?? 0;
  const over = maxChars ? count > maxChars : false;

  return (
    <div className={className}>
      <span className={over ? 'text-destructive' : 'text-muted-foreground'}>
        {count}
        {typeof maxChars === 'number' && ` / ${maxChars}`}
      </span>
    </div>
  );
}

export default MessageCounter;
