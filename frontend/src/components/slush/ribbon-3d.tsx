import React from 'react';

interface Ribbon3DProps {
  className?: string;
  variant?: 'hero' | 'curve' | 'loop';
}

export const Ribbon3D: React.FC<Ribbon3DProps> = ({ className = '', variant = 'hero' }) => {
  if (variant === 'curve') {
    return (
      <svg
        viewBox="0 0 1200 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-auto pointer-events-none select-none ${className}`}
      >
        <path
          d="M -100 200 C 200 50, 450 250, 800 120 C 1050 20, 1250 180, 1350 100"
          stroke="#4da2ff"
          strokeWidth="68"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M -100 200 C 200 50, 450 250, 800 120 C 1050 20, 1250 180, 1350 100"
          stroke="#7ebbff"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />
      </svg>
    );
  }

  // Default hero ribbon wrapping form
  return (
    <div className={`relative w-full overflow-hidden pointer-events-none select-none ${className}`}>
      <svg
        viewBox="0 0 1440 450"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="ribbon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Shadow path */}
        <path
          d="M -60 220 C 240 60, 520 380, 920 180 C 1220 30, 1380 290, 1520 180"
          stroke="#2678d9"
          strokeWidth="76"
          strokeLinecap="round"
          opacity="0.4"
        />
        {/* Main 3D tubular ribbon in Electric Blue #4da2ff */}
        <path
          d="M -60 210 C 240 50, 520 370, 920 170 C 1220 20, 1380 280, 1520 170"
          stroke="#4da2ff"
          strokeWidth="72"
          strokeLinecap="round"
        />
        {/* Highlight sheen path for inflatable 3D cylinder illusion */}
        <path
          d="M -60 202 C 240 42, 520 362, 920 162 C 1220 12, 1380 272, 1520 162"
          stroke="#a6d2ff"
          strokeWidth="22"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* Crisp specular highlight line */}
        <path
          d="M -60 198 C 240 38, 520 358, 920 158 C 1220 8, 1380 268, 1520 158"
          stroke="#ffffff"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
    </div>
  );
};

export default Ribbon3D;
