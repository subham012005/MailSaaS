import React from 'react';
import { cn } from '@/lib/utils';

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function FeatureCard({ children, className, ...props }: FeatureCardProps) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground rounded-2xl p-6 border border-border shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
