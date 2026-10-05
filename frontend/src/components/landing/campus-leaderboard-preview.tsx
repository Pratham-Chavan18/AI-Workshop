import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Sticker } from '@/components/slush/sticker';
import { Trophy, ArrowUpRight, Flame, Building2 } from 'lucide-react';

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

export const CampusLeaderboardPreview: React.FC = () => {
  const { data, isLoading } = useQuery<CampusLeaderboardResponse>({
    queryKey: ['leaderboard', 'campuses', 'preview'],
    queryFn: async () => {
      const res = await api.get('/leaderboard/campuses?limit=5');
      return res.data;
    },
    refetchInterval: 30_000,
  });

  const topCampuses = data?.items?.slice(0, 5) || [];
  const totalRegistrations = data?.total || 0;

  const renderRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return (
      <span className="w-8 h-8 rounded-full border border-black bg-slush-mist font-bold text-xs flex items-center justify-center text-black">
        #{rank}
      </span>
    );
  };

  return (
    <section className="py-20 md:py-28 bg-slush-sky border-b border-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Sticker
            color="sunburst"
            icon={<Trophy className="w-3.5 h-3.5" />}
            label="LIVE CAMPUS STANDINGS"
            className="mb-4"
          />
          <h2 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight text-black uppercase leading-tight">
            Campus Leaderboard Preview
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-800 font-medium">
            Colleges across India are rallying their final-year batches. Which college will dominate the top spot?
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="slush-card-elevated bg-white border border-black overflow-hidden"
        >
          {/* Header */}
          <div className="bg-slush-lavender border-b border-black p-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-black" />
              <span className="font-display font-extrabold text-xl text-black uppercase">
                Top Engineering Campuses
              </span>
            </div>
            {totalRegistrations > 0 && (
              <div className="slush-pill px-3 py-1 bg-white text-black text-xs font-bold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-slush-ember" />
                <span>{totalRegistrations} Registrations Nationwide</span>
              </div>
            )}
          </div>

          {/* List Content */}
          <div className="p-0 divide-y divide-black/10">
            {isLoading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-slush-mist"></div>
                      <div className="h-4 w-48 bg-slush-mist rounded"></div>
                    </div>
                    <div className="h-4 w-12 bg-slush-mist rounded"></div>
                  </div>
                ))}
              </div>
            ) : topCampuses.length > 0 ? (
              topCampuses.map((campus) => (
                <div
                  key={campus.collegeId}
                  className="flex items-center justify-between p-4 sm:px-6 hover:bg-slush-mist/50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-8 flex items-center justify-center shrink-0">
                      {renderRankBadge(campus.rank)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm sm:text-base text-black truncate">
                        {campus.collegeName}
                      </p>
                      {(campus.city || campus.state) && (
                        <p className="text-xs text-neutral-600 truncate font-medium">
                          {[campus.city, campus.state].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-4">
                    <span className="font-display font-extrabold text-xl text-black">
                      {campus.registrations}
                    </span>
                    <span className="text-xs text-neutral-600 ml-1 font-bold">students</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-sm font-medium text-neutral-600">
                <p>Be the first from your college to register and put your campus on the leaderboard!</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slush-mist/60 border-t border-black p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs font-semibold text-neutral-700">
              Represent your campus in the AI Workshop challenge
            </span>
            <Link
              to="/leaderboard"
              className="slush-pill px-4 py-2 bg-black text-white hover:bg-neutral-800 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all"
            >
              <span>View Full Leaderboard</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CampusLeaderboardPreview;
