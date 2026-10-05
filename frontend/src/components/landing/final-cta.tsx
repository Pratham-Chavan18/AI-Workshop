import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sticker } from '@/components/slush/sticker';
import { ArrowUpRight, ShieldCheck, Flame } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-24 md:py-32 bg-slush-mint border-b border-black text-center relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
        <Sticker
          color="ember"
          icon={<Flame className="w-3.5 h-3.5" />}
          label="LIMITED TO 500 VERIFIED SEATS"
          className="mb-4"
        />

        <motion.h2
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-sculptural text-black text-5xl sm:text-7xl md:text-8xl tracking-tight leading-[0.80] uppercase"
        >
          READY TO BUILD <br />
          YOUR FIRST AI PROJECT?
        </motion.h2>

        <p className="mt-6 text-base sm:text-xl text-black font-medium max-w-xl mx-auto leading-relaxed">
          Zero cost. One hour with practical AI development that turns into a live project you own forever.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link to="/register" className="w-full sm:w-auto">
            <button className="slush-pill px-10 py-4 bg-black text-white hover:bg-neutral-800 text-base sm:text-lg font-bold tracking-[0.032em] inline-flex items-center justify-center gap-2 shadow-none transition-transform hover:-translate-y-0.5 w-full sm:w-auto">
              <span>Reserve My Free Seat Now</span>
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-black">
          <ShieldCheck className="w-4 h-4 text-black" />
          <span>100% Free • No Credit Card Required • Instant Confirmation</span>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
