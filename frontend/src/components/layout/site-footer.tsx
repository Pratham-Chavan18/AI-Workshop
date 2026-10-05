import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles } from 'lucide-react';

export const SiteFooter: React.FC = () => {
  return (
    <footer className="border-t border-black bg-slush-paper text-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand information */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-black bg-slush-voltage flex items-center justify-center text-white font-bold text-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight">AI WORKSHOP</span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slush-sunburst border border-black">
              2026
            </span>
          </div>
          <p className="text-xs text-neutral-600 max-w-sm font-medium">
            Powered by NxtWave. Accelerating final-year engineers into hands-on AI builders.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center items-center gap-2 text-xs sm:text-sm font-bold">
          <Link to="/" className="slush-pill px-3.5 py-1.5 bg-white hover:bg-slush-mist">
            Home
          </Link>
          <Link to="/register" className="slush-pill px-3.5 py-1.5 bg-slush-mint hover:bg-slush-mint/80">
            Registration
          </Link>
          <Link to="/leaderboard" className="slush-pill px-3.5 py-1.5 bg-slush-sunburst hover:bg-slush-sunburst/80">
            Leaderboard
          </Link>
          <Link to="/admin" className="slush-pill px-3.5 py-1.5 bg-white hover:bg-slush-mist flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            Admin
          </Link>
        </div>

        {/* Privacy & Copyright */}
        <div className="text-center md:text-right text-xs text-neutral-600 flex flex-col gap-1 font-medium">
          <span>Official NxtWave Workshop Initiative</span>
          <span>&copy; {new Date().getFullYear()} NxtWave Disruptive Technologies. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;

