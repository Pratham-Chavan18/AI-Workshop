import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { fadeUp, viewportOnce } from '@/lib/motion';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  return (
    <AuroraBackground className="py-24 md:py-36 border-t border-border/80">
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20"
        >
          <Sparkles className="w-3.5 h-3.5 fill-primary" />
          <span>Limited to 500 Verified Seats</span>
        </motion.div>

        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground"
        >
          Ready to Build Your First <br />
          <span className="text-gradient">AI Project in 60 Minutes?</span>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto"
        >
          No fluff. No high price tags. One hour with practical AI development that turns into a live project you own forever.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="lg" variant="primary" className="w-full sm:w-auto text-base gap-2 px-10 py-6">
              <span>Reserve My Free Seat Now</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>100% Free • No Credit Card Required • Instant Confirmation</span>
        </div>
      </div>
    </AuroraBackground>
  );
};

export default FinalCTA;
