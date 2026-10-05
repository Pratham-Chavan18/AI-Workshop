import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Award } from 'lucide-react';

interface ReferrerItem {
  rank: number;
  displayName: string;
  collegeName: string;
  referralCount: number;
}

interface ReferrerLeaderboardResponse {
  items: ReferrerItem[];
}

export const ReferrerLeaderboard: React.FC = () => {
  const { data, isLoading } = useQuery<ReferrerLeaderboardResponse>({
    queryKey: ['leaderboard', 'referrers'],
    queryFn: async () => {
      const res = await api.get('/leaderboard/referrers?limit=100');
      return res.data;
    },
    refetchInterval: 30_000,
  });

  const items = data?.items || [];

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
    <div className="slush-card-elevated bg-white border border-black overflow-hidden shadow-none">
      <div className="bg-slush-sunburst border-b border-black p-5 sm:p-6">
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-black uppercase flex items-center gap-2">
          <Award className="w-6 h-6 text-black" />
          Top Student Ambassadors
        </h2>
        <p className="text-xs sm:text-sm text-neutral-800 font-medium mt-1">
          Campus leaders driving peer registrations • Updated live every 30s
        </p>
      </div>

      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/10 bg-slush-mist/50 text-xs font-bold uppercase tracking-wide text-neutral-700">
              <th className="py-3 px-4 sm:px-6 w-16 text-center">Rank</th>
              <th className="py-3 px-4 sm:px-6">Student Ambassador</th>
              <th className="py-3 px-4 sm:px-6 hidden sm:table-cell">Campus</th>
              <th className="py-3 px-4 sm:px-6 text-right">Referrals Made</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-6 text-center">
                    <div className="w-6 h-6 rounded-full bg-slush-mist mx-auto"></div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-4 w-40 bg-slush-mist rounded"></div>
                  </td>
                  <td className="py-4 px-6 hidden sm:table-cell">
                    <div className="h-4 w-32 bg-slush-mist rounded"></div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="h-4 w-8 bg-slush-mist rounded ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : items.length > 0 ? (
              items.map((ref) => (
                <tr
                  key={`${ref.rank}-${ref.displayName}`}
                  className={`border-b border-black/10 hover:bg-slush-mist/50 transition-colors ${
                    ref.rank <= 3 ? 'bg-slush-sunburst/15' : ''
                  }`}
                >
                  <td className="py-4 px-4 sm:px-6 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      {renderRankBadge(ref.rank)}
                    </div>
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    <div className="font-bold text-sm sm:text-base text-black">
                      {ref.displayName}
                    </div>
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-xs sm:text-sm text-neutral-600 hidden sm:table-cell font-medium">
                    {ref.collegeName}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                    <span className="font-display font-extrabold text-xl text-black">
                      {ref.referralCount}
                    </span>
                    <span className="text-xs text-neutral-600 ml-1 font-bold">peers</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm font-medium text-neutral-600">
                  No student referrals recorded yet. Be the first ambassador!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReferrerLeaderboard;
