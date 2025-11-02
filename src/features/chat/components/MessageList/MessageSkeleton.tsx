// MessageSkeleton.tsx
// Purpose: Placeholder skeleton while loading or streaming.

import React from 'react';
import { cn } from '@/lib/utils';
import { animationClasses } from '@/styles/animations';

export interface MessageSkeletonProps {
  from?: 'user' | 'assistant';
  className?: string;
}

export function MessageSkeleton({ from = 'assistant', className }: MessageSkeletonProps) {
  return (
    <div className={cn('flex w-full gap-3 px-3 py-2', from === 'user' ? 'flex-row-reverse' : '', className)}>
      <div className={cn('h-8 w-8 shrink-0 rounded-full bg-[#2f2f2f]', animationClasses.loading.pulse)} />
      <div className="flex-1">
        <div className={cn('h-4 rounded w-3/4 mb-2 bg-gradient-to-r from-transparent via-white/10 to-transparent', animationClasses.loading.shimmer)} />
        <div className={cn('h-4 rounded w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent', animationClasses.loading.shimmer)} />
      </div>
    </div>
  );
}

export function MessageSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: Math.min(5, Math.max(3, count)) }).map((_, i) => (
        <MessageSkeleton key={i} from={i % 2 === 0 ? 'assistant' : 'user'} />
      ))}
    </div>
  );
}

export default MessageSkeleton;
