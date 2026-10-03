import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Heart } from 'lucide-react';

export const SiteFooter: React.FC = () => {
  return (
    <footer className="border-t border-border bg-card/50 text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand information */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight">AI 60 × 500 Campaign</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-sm">
            Powered by NxtWave. Accelerating 500 final-year engineers into hands-on AI builders.
          </p>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">
            Workshop
          </Link>
          <Link to="/register" className="hover:text-primary transition-colors">
            Registration
          </Link>
          <Link to="/leaderboard" className="hover:text-primary transition-colors">
            Campus Leaderboard
          </Link>
          <Link to="/admin" className="hover:text-primary transition-colors flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            Admin
          </Link>
        </div>

        {/* Privacy & Copyright */}
        <div className="text-center md:text-right text-xs text-muted-foreground flex flex-col gap-1">
          <div className="flex items-center justify-center md:justify-end gap-1">
            <span>Built for campus innovators with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
          <span>&copy; {new Date().getFullYear()} NxtWave Disruptive Technologies. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
