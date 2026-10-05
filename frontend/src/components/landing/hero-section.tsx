import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sticker } from '@/components/slush/sticker';
import { Ribbon3D } from '@/components/slush/ribbon-3d';
import { ArrowUpRight, Trophy, Sparkles, Rocket, Check, Award, Flame, Users } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative w-full bg-slush-sky border-b border-black pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden">
      {/* 3D Electric Blue Ribbon Wrapping Motif */}
      <div className="absolute inset-0 flex items-center justify-center opacity-85 pointer-events-none z-0">
        <Ribbon3D className="w-[140%] max-w-none transform -translate-y-8 md:-translate-y-4" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Floating Sticker Cluster (Top) */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6">
          <Sticker
            color="mint"
            icon={<Check className="w-3.5 h-3.5" />}
            label="100% FREE WORKSHOP"
            rotate={-2}
            size="sm"
          />
          <Sticker
            color="sunburst"
            icon={<Award className="w-3.5 h-3.5" />}
            label="FINAL-YEAR ENGINEERS"
            rotate={3}
            size="sm"
          />
          <Sticker
            color="ember"
            icon={<Flame className="w-3.5 h-3.5" />}
            label="500 SEATS ONLY"
            rotate={-1}
            size="sm"
          />
        </div>

        {/* Sculptural Display Headline - Slush Lateral/Antonio 800 style */}
        <div className="relative my-2 select-none">
          {/* Decorative floating stickers pinned around headline */}
          <div className="hidden lg:block absolute -top-8 -left-12 z-20">
            <Sticker
              color="ember"
              icon={<Rocket className="w-4 h-4" />}
              label="ROCKET SPEED"
              rotate={-12}
              size="md"
            />
          </div>

          <div className="hidden lg:block absolute -top-6 -right-10 z-20">
            <Sticker
              color="voltage"
              icon={<Sparkles className="w-4 h-4" />}
              label="PORTFOLIO READY"
              rotate={10}
              size="md"
            />
          </div>

          <div className="hidden lg:block absolute -bottom-4 -right-14 z-20">
            <Sticker
              color="sunburst"
              icon={<Trophy className="w-4 h-4" />}
              label="CAMPUS CUP"
              rotate={-8}
              size="md"
            />
          </div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-sculptural text-black text-6xl sm:text-8xl md:text-9xl lg:text-[140px] tracking-tight leading-[0.80] drop-shadow-none"
          >
            BUILD IN
            <br />
            <span className="text-black">60 MINUTES</span>
          </motion.h1>
        </div>

        {/* Tagline Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-base sm:text-xl md:text-2xl font-medium text-black max-w-2xl mx-auto leading-tight"
        >
          One hour. One real AI project. Zero cost. Transform into a hands-on AI builder and lead your campus to #1 on the national leaderboard.
        </motion.p>

        {/* Pill Buttons: Black Filled Primary CTA + Outlined Ghost Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto"
        >
          <Link
            to="/register"
            className="slush-pill w-full sm:w-auto px-8 py-3.5 bg-black text-white hover:bg-neutral-800 text-sm sm:text-base font-bold tracking-[0.032em] flex items-center justify-center gap-2 shadow-none transition-transform hover:-translate-y-0.5"
          >
            <span>Reserve My Free Seat</span>
            <ArrowUpRight className="w-5 h-5" />
          </Link>

          <Link
            to="/leaderboard"
            className="slush-pill w-full sm:w-auto px-8 py-3.5 bg-white text-black hover:bg-slush-mist text-sm sm:text-base font-bold tracking-[0.032em] flex items-center justify-center gap-2 shadow-none transition-transform hover:-translate-y-0.5"
          >
            <Trophy className="w-4 h-4 text-black" />
            <span>Campus Leaderboard</span>
          </Link>
        </motion.div>

        {/* Social Proof Sticker Row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold"
        >
          <div className="slush-pill px-3.5 py-1.5 bg-white text-black flex items-center gap-1.5">
            <Users className="w-4 h-4 text-black" />
            <span>500 Verified Engineers Only</span>
          </div>

          <div className="slush-pill px-3.5 py-1.5 bg-slush-lavender text-black flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-black" />
            <span>No Coding Pre-requisite</span>
          </div>

          <div className="slush-pill px-3.5 py-1.5 bg-slush-mint text-black flex items-center gap-1.5">
            <Check className="w-4 h-4 text-black" />
            <span>Live Interactive Guidance</span>
          </div>

          <div className="slush-pill px-3.5 py-1.5 bg-slush-sunburst text-black flex items-center gap-1.5">
            <Award className="w-4 h-4 text-black" />
            <span>Official Completion Certificate</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
