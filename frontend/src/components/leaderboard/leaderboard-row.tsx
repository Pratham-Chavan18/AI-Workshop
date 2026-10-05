import React from 'react';
import { motion } from 'framer-motion';

export interface LeaderboardRowProps {
  rank: number;
  collegeName: string;
  city?: string | null;
  state?: string | null;
  registrations: number;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  rank,
  collegeName,
  city,
  state,
  registrations,
}) => {
  const isTopThree = rank <= 3;

  const renderRankBadge = (r: number) => {
    if (r === 1) return <span className="text-2xl">🥇</span>;
    if (r === 2) return <span className="text-2xl">🥈</span>;
    if (r === 3) return <span className="text-2xl">🥉</span>;
    return (
      <span className="w-8 h-8 rounded-full border border-black bg-slush-mist font-bold text-xs flex items-center justify-center text-black">
        #{r}
      </span>
    );
  };

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`border-b border-black/10 hover:bg-slush-mist/50 transition-colors ${
        isTopThree ? 'bg-slush-lavender/20' : ''
      }`}
    >
      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
        <div className="flex items-center justify-center w-8">
          {renderRankBadge(rank)}
        </div>
      </td>
      <td className="py-4 px-4 sm:px-6">
        <div className="font-bold text-sm sm:text-base text-black">
          {collegeName}
        </div>
      </td>
      <td className="py-4 px-4 sm:px-6 text-xs sm:text-sm text-neutral-600 hidden sm:table-cell font-medium">
        {[city, state].filter(Boolean).join(', ') || '—'}
      </td>
      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
        <span className="font-display font-extrabold text-xl text-black">
          {registrations}
        </span>
        <span className="text-xs text-neutral-600 ml-1 font-bold">students</span>
      </td>
    </motion.tr>
  );
};

export default LeaderboardRow;
