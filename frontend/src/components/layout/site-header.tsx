import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Trophy, UserPlus } from 'lucide-react';

export const SiteHeader: React.FC = () => {
  const location = useLocation();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Wordmark */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-[#0091ff] flex items-center justify-center text-white shadow-sm glow-cobalt group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-lg tracking-tight text-foreground">
              AI Workshop
            </span>
            <Badge variant="default" className="hidden sm:inline-flex text-[10px] py-0 px-2">
              NxtWave
            </Badge>
          </div>
        </Link>

        {/* Navigation links & CTAs */}
        <nav className="flex items-center gap-3">
          <Link to="/leaderboard">
            <Button
              variant={location.pathname === '/leaderboard' ? 'secondary' : 'ghost'}
              size="sm"
              className="hidden sm:inline-flex gap-1.5"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              Leaderboard
            </Button>
          </Link>

          <Link to="/register">
            <Button variant="primary" size="sm" className="gap-1.5">
              <UserPlus className="w-4 h-4" />
              <span>Register Free</span>
            </Button>
          </Link>
        </nav>
      </div>
    </motion.header>
  );
};

export default SiteHeader;
