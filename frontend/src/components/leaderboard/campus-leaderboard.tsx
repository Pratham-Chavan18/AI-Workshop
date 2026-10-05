import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LeaderboardRow } from './leaderboard-row';
import { Building2, Search } from 'lucide-react';

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
    <div className="slush-card-elevated bg-white border border-black overflow-hidden shadow-none">
      <div className="bg-slush-lavender border-b border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6">
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-black uppercase flex items-center gap-2">
            <Building2 className="w-6 h-6 text-black" />
            National Campus Rankings
          </h2>
          <p className="text-xs sm:text-sm text-neutral-700 font-medium mt-1">
            Ranked by verified student registrations • Live auto-refresh every 30s
          </p>
        </div>

        {/* Filter Input */}
        <div className="relative w-full sm:w-72">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your college..."
            className="w-full h-10 px-4 pl-9 text-xs sm:text-sm font-medium rounded-pill border border-black bg-white focus:outline-none focus:ring-2 focus:ring-slush-electric"
          />
          <Search className="w-4 h-4 text-black absolute left-3 top-3" />
        </div>
      </div>

      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/10 bg-slush-mist/50 text-xs font-bold uppercase tracking-wide text-neutral-700">
              <th className="py-3 px-4 sm:px-6 w-16 text-center">Rank</th>
              <th className="py-3 px-4 sm:px-6">Engineering College</th>
              <th className="py-3 px-4 sm:px-6 hidden sm:table-cell">Location</th>
              <th className="py-3 px-4 sm:px-6 text-right">Registrations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {isLoading ? (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-6 text-center">
                    <div className="w-6 h-6 rounded-full bg-slush-mist mx-auto"></div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-4 w-48 bg-slush-mist rounded"></div>
                  </td>
                  <td className="py-4 px-6 hidden sm:table-cell">
                    <div className="h-4 w-24 bg-slush-mist rounded"></div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="h-4 w-12 bg-slush-mist rounded ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : filteredItems.length > 0 ? (
              filteredItems.map((campus) => (
                <LeaderboardRow
                  key={campus.collegeId}
                  rank={campus.rank}
                  collegeName={campus.collegeName}
                  city={campus.city}
                  state={campus.state}
                  registrations={campus.registrations}
                />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm font-medium text-neutral-600">
                  {search ? 'No colleges found matching your search.' : 'No colleges have registered yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampusLeaderboard;
