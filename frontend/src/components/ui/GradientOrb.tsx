import React from 'react';
import { cn } from '@/lib/utils';

interface GradientOrbProps {
  color?: 'mint' | 'peach' | 'lavender' | 'sky' | 'rose';
  className?: string;
}

export function GradientOrb({ color = 'mint', className }: GradientOrbProps) {
  const colorMap = {
    mint: 'bg-[var(--gradient-mint)]',
    peach: 'bg-[var(--gradient-peach)]',
    lavender: 'bg-[var(--gradient-lavender)]',
    sky: 'bg-[var(--gradient-sky)]',
    rose: 'bg-[var(--gradient-rose)]',
  };

  return (
    <div
      className={cn(
        'absolute rounded-full mix-blend-multiply filter blur-[120px] opacity-40 pointer-events-none',
        colorMap[color],
        className
      )}
    />
  );
}
