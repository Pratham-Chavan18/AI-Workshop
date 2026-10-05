import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center font-bold tracking-[0.03em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4da2ff] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        primary:
          'bg-black text-white hover:bg-neutral-800 active:bg-neutral-900 border border-black rounded-pill shadow-none',
        secondary:
          'bg-white text-black hover:bg-slush-mist active:bg-neutral-200 border border-black rounded-pill shadow-none',
        outline:
          'bg-white text-black hover:bg-slush-mist active:bg-neutral-200 border border-black rounded-pill shadow-none',
        ghost:
          'bg-transparent text-black hover:bg-slush-mist active:bg-neutral-200 rounded-pill border border-transparent hover:border-black',
        destructive:
          'bg-slush-ember text-white hover:bg-red-600 active:bg-red-700 border border-black rounded-pill shadow-none',
      },
      size: {
        default: 'h-11 px-6 py-2 text-sm',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-13 px-8 text-base font-bold',
        icon: 'h-10 w-10 p-0 rounded-full border border-black',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'ref'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, asChild, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -1 }}
        whileTap={{ y: 1 }}
        transition={{ duration: 0.1 }}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
