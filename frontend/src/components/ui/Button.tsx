import React from 'react';
import { cn } from '@/lib/utils'; // assuming standard cn utility exists

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'tertiary';
  size?: 'default' | 'sm' | 'lg';
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary-active active:bg-primary-active',
      outline: 'border border-border bg-transparent text-foreground hover:bg-muted/50',
      tertiary: 'bg-transparent text-foreground hover:underline underline-offset-4',
    };

    const sizes = {
      default: 'h-10 px-5 py-2.5 text-[15px]',
      sm: 'h-9 px-4 text-sm',
      lg: 'h-12 px-8 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
