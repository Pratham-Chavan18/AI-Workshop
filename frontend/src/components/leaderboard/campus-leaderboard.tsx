import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LeaderboardRow } from './leaderboard-row';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Building2, Search, Trophy } from 'lucide-react';

interface CampusItem {
  rank: number;
  collegeId: string;
  collegeName: string;
  city?: string | null;
  state?: string | null;
  registrations: number;
}

interface CampusLeaderboardResponse {
  items: CampusItem[];
  total: number;
}

export const CampusLeaderboard: React.FC = () => {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery<CampusLeaderboardResponse>({
    queryKey: ['leaderboard', 'campuses'],
    queryFn: async () => {
      const res = await api.get('/leaderboard/campuses?limit=100');
      return res.data;
    },
    refetchInterval: 30_000,
  });

  const allItems = data?.items || [];
  const filteredItems = allItems.filter((item) =>
    item.collegeName.toLowerCase().includes(search.toLowerCase().trim()) ||
    (item.city && item.city.toLowerCase().includes(search.toLowerCase().trim())) ||
    (item.state && item.state.toLowerCase().includes(search.toLowerCase().trim()))
  );

  return (
    <Card className="shadow-sm border-border overflow-hidden">
      <CardHeader className="bg-canvas-soft border-b border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            National Engineering Campus Standings
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ranked by verified student registrations • Live auto-refresh every 30s
          </p>
        </div>

        {/* Filter Input */}
        <div className="relative w-full sm:w-64">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your college..."
            className="h-9 text-xs pl-8 bg-background"
          />
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-3" />
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <th className="py-3 px-4 sm:px-6 w-16 text-center">Rank</th>
              <th className="py-3 px-4 sm:px-6">Engineering College</th>
              <th className="py-3 px-4 sm:px-6 hidden sm:table-cell">Location</th>
              <th className="py-3 px-4 sm:px-6 text-right">Registrations</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // 10-row skeleton loading
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-border/40 animate-pulse">
                  <td className="py-4 px-4 sm:px-6 text-center">
                    <div className="w-7 h-7 bg-muted rounded-full mx-auto" />
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    <div className="h-4 w-48 sm:w-64 bg-muted rounded" />
                  </td>
                  <td className="py-4 px-4 sm:px-6 hidden sm:table-cell">
                    <div className="h-4 w-28 bg-muted rounded" />
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className="h-4 w-12 bg-muted rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <LeaderboardRow
                  key={item.collegeId}
                  rank={item.rank}
                  collegeName={item.collegeName}
                  city={item.city}
                  state={item.state}
                  registrations={item.registrations}
                />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-muted-foreground">
                  <Trophy className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="font-semibold text-foreground">
                    {search ? 'No matching college found' : 'No registrations yet'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {search ? 'Try clearing your search query.' : 'Be the first from your campus to register!'}
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

export default CampusLeaderboard;
