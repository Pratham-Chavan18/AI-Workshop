import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { fadeUp } from '@/lib/motion';
import { Sparkles, ArrowRight, Trophy, GraduationCap, CheckCircle2, Hammer, Briefcase } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <AuroraBackground className="pt-20 pb-24 md:pt-28 md:pb-36 border-b border-border/60">
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-1.5"
        >
          <Badge variant="default" className="px-4 py-1 text-xs uppercase tracking-wider font-bold">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary animate-pulse" />
            Free Live AI Workshop
          </Badge>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.12]"
        >
          Build Your First <br />
          <span className="text-gradient">AI Project in 60 Minutes</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          One hour. One real project. Zero cost. Designed exclusively for final-year engineering students to acquire immediate, portfolio-ready AI development skills.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="lg" variant="primary" className="w-full sm:w-auto text-base gap-2 px-8 py-6">
              <span>Reserve My Free Seat</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>

          <Link to="/leaderboard" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base gap-2 px-8 py-6">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Campus Leaderboard</span>
            </Button>
          </Link>
        </motion.div>

        {/* Social Proof Badges */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-border/40 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs sm:text-sm text-muted-foreground"
        >
          <div className="flex items-center justify-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span>500 Final-Year Engineers</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Beginner Friendly</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Hammer className="w-4 h-4 text-primary" />
            <span>100% Live Hands-on Build</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Briefcase className="w-4 h-4 text-amber-500" />
            <span>Resume & Portfolio Ready</span>
          </div>
        </motion.div>
      </div>
    </AuroraBackground>
  );
};

export default HeroSection;
