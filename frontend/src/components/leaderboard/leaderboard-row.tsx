import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/motion';

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
      <span className="w-7 h-7 rounded-full bg-muted font-bold text-xs flex items-center justify-center text-muted-foreground">
        #{r}
      </span>
    );
  };

  return (
    <motion.tr
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={`border-b border-border/60 hover:bg-muted/40 transition-colors ${
        isTopThree ? 'bg-primary/5 font-medium' : ''
      }`}
    >
      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
        <div className="flex items-center justify-center w-8">
          {renderRankBadge(rank)}
        </div>
      </td>
      <td className="py-4 px-4 sm:px-6">
        <div className="font-semibold text-sm sm:text-base text-foreground">
          {collegeName}
        </div>
      </td>
      <td className="py-4 px-4 sm:px-6 text-xs sm:text-sm text-muted-foreground hidden sm:table-cell">
        {[city, state].filter(Boolean).join(', ') || '—'}
      </td>
      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
        <span className="font-extrabold text-base sm:text-lg text-primary">
          {registrations}
        </span>
        <span className="text-xs text-muted-foreground ml-1 hidden xs:inline">students</span>
      </td>
    </motion.tr>
  );
};

export default LeaderboardRow;
