import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MarqueeStrip } from '@/components/slush/marquee-strip';
import { Trophy, ArrowUpRight } from 'lucide-react';

export const SiteHeader: React.FC = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full bg-slush-paper border-b border-black">
      {/* Top Marquee Announcement Band */}
      <MarqueeStrip />

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Slush Circular Brand Logo Mark */}
        <Link to="/" className="flex items-center gap-1.5 sm:gap-3 shrink-0 group">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-black bg-white flex items-center justify-center font-display font-extrabold text-base sm:text-xl text-black transition-transform group-hover:scale-105 shrink-0">
            AI
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-display font-extrabold text-base sm:text-2xl tracking-tight text-black whitespace-nowrap">
              AI WORKSHOP
            </span>
            <span className="hidden md:inline-block px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-full bg-slush-mint border border-black text-black">
              NxtWave
            </span>
          </div>
        </Link>

        {/* Slush Pill Navigation Links & Filled CTA */}
        <nav className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <Link
            to="/leaderboard"
            className={`slush-pill px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold tracking-[0.03em] flex items-center gap-1 sm:gap-1.5 transition-colors whitespace-nowrap ${
              location.pathname === '/leaderboard'
                ? 'bg-slush-sunburst text-black'
                : 'bg-white text-black hover:bg-slush-mist'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black shrink-0" />
            <span className="hidden sm:inline">Campus Leaderboard</span>
            <span className="sm:hidden">Leaderboard</span>
          </Link>

          <Link
            to="/register"
            className="slush-pill px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold tracking-[0.03em] bg-black text-white hover:bg-neutral-800 flex items-center gap-1 sm:gap-1.5 transition-all whitespace-nowrap"
          >
            <span className="hidden sm:inline">Register Free</span>
            <span className="sm:hidden">Register</span>
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default SiteHeader;

