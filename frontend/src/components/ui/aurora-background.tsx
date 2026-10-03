import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  className,
  children,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-background text-foreground transition-bg',
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Cobalt aurora orb 1 */}
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [0, 40, -20, 0],
                  y: [0, -30, 20, 0],
                  scale: [1, 1.15, 0.95, 1],
                }
          }
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-[20%] -left-[10%] w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-primary/20 to-[#0091ff]/20 blur-[120px] opacity-75"
        />

        {/* Soft violet / cobalt orb 2 */}
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [0, -50, 30, 0],
                  y: [0, 40, -30, 0],
                  scale: [1, 0.9, 1.1, 1],
                }
          }
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-[40%] -right-[15%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#0064e0]/15 to-indigo-500/15 blur-[130px] opacity-60"
        />

        {/* Subtle bottom center orb */}
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  scale: [0.95, 1.1, 0.95],
                  opacity: [0.4, 0.7, 0.4],
                }
          }
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-[20%] left-[25%] w-[500px] h-[500px] rounded-full bg-gradient-to-t from-sky-400/15 to-transparent blur-[110px]"
        />
      </div>

      {children}
    </div>
  );
};
