import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-tight border border-black transition-colors select-none shadow-none',
  {
    variants: {
      variant: {
        default: 'bg-slush-mint text-black',
        secondary: 'bg-slush-lavender text-black',
        success: 'bg-slush-mint text-black',
        outline: 'bg-white text-black',
        sunburst: 'bg-slush-sunburst text-black',
        ember: 'bg-slush-ember text-white',
        voltage: 'bg-slush-voltage text-white',
        cobalt: 'bg-slush-electric text-black',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
