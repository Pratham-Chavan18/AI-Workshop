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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Slush Circular Brand Logo Mark */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full border border-black bg-white flex items-center justify-center font-display font-extrabold text-xl text-black transition-transform group-hover:scale-105">
            AI
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-2xl tracking-tight text-black">
              AI WORKSHOP
            </span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-full bg-slush-mint border border-black text-black">
              NxtWave
            </span>
          </div>
        </Link>

        {/* Slush Pill Navigation Links & Filled CTA */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link to="/leaderboard">
            <button
              className={`slush-pill px-4 py-2 text-xs sm:text-sm font-bold tracking-[0.03em] flex items-center gap-1.5 transition-colors ${
                location.pathname === '/leaderboard'
                  ? 'bg-slush-sunburst text-black'
                  : 'bg-white text-black hover:bg-slush-mist'
              }`}
            >
              <Trophy className="w-4 h-4 text-black" />
              <span>Campus Leaderboard</span>
            </button>
          </Link>

          <Link to="/register">
            <button className="slush-pill px-5 py-2 text-xs sm:text-sm font-bold tracking-[0.03em] bg-black text-white hover:bg-neutral-800 flex items-center gap-1.5 transition-all">
              <span>Register Free</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default SiteHeader;

