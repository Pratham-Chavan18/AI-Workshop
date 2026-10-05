import React from 'react';

interface MarqueeStripProps {
  text?: string[];
  className?: string;
}

export const MarqueeStrip: React.FC<MarqueeStripProps> = ({
  text = [
    'BUILD YOUR FIRST AI PROJECT IN 60 MINUTES',
    'FREE WORKSHOP FOR FINAL-YEAR STUDENTS',
    '500 EXCLUSIVE SEATS',
    'INVITE CLASSMATES TO CLIMB CAMPUS LEADERBOARD',
    'EARN CERTIFICATE & VIP BADGE',
    'HOSTED BY NxtWave',
  ],
  className = '',
}) => {
  const repeatedText = [...text, ...text, ...text, ...text];

  return (
    <div className={`w-full bg-black text-white overflow-hidden py-2 border-y border-black select-none ${className}`}>
      <div className="animate-marquee flex items-center whitespace-nowrap">
        {repeatedText.map((item, index) => (
          <div key={index} className="flex items-center mx-3 text-xs md:text-sm font-bold tracking-[0.032em] uppercase">
            <span>{item}</span>
            <span className="inline-block w-2 h-2 rounded-full bg-slush-sunburst mx-4 border border-black/40" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarqueeStrip;
