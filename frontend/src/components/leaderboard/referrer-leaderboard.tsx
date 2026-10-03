import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Award, Users } from 'lucide-react';

interface ReferrerItem {
  rank: number;
  userId: string;
  fullName: string;
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
      <span className="w-7 h-7 rounded-full bg-muted font-bold text-xs flex items-center justify-center text-muted-foreground">
        #{r}
      </span>
    );
  };

  return (
    <Card className="shadow-sm border-border overflow-hidden">
      <CardHeader className="bg-canvas-soft border-b border-border/80 py-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          Top Student Ambassadors
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Campus leaders driving peer registrations • Updated live
        </p>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <th className="py-3 px-4 sm:px-6 w-16 text-center">Rank</th>
              <th className="py-3 px-4 sm:px-6">Student Name</th>
              <th className="py-3 px-4 sm:px-6 hidden sm:table-cell">Campus</th>
              <th className="py-3 px-4 sm:px-6 text-right">Friends Referred</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border/40 animate-pulse">
                  <td className="py-4 px-4 sm:px-6 text-center">
                    <div className="w-7 h-7 bg-muted rounded-full mx-auto" />
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    <div className="h-4 w-40 bg-muted rounded" />
                  </td>
                  <td className="py-4 px-4 sm:px-6 hidden sm:table-cell">
                    <div className="h-4 w-48 bg-muted rounded" />
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className="h-4 w-12 bg-muted rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : items.length > 0 ? (
              items.map((item) => (
                <tr
                  key={item.userId}
                  className={`border-b border-border/60 hover:bg-muted/40 transition-colors ${
                    item.rank <= 3 ? 'bg-amber-500/5 font-medium' : ''
                  }`}
                >
                  <td className="py-4 px-4 sm:px-6 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center w-8 mx-auto">
                      {renderRankBadge(item.rank)}
                    </div>
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    <span className="font-semibold text-sm sm:text-base text-foreground">
                      {item.fullName}
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-xs sm:text-sm text-muted-foreground hidden sm:table-cell">
                    {item.collegeName}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                    <span className="font-extrabold text-base sm:text-lg text-primary">
                      {item.referralCount}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">referrals</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-muted-foreground">
                  <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="font-semibold text-foreground">No referrals recorded yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Refer your friends after registering to become the top ambassador!
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default ReferrerLeaderboard;
