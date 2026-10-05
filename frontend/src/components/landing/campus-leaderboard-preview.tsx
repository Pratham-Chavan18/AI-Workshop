import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fadeUp, viewportOnce } from '@/lib/motion';
import { Trophy, ArrowRight, Building2, Flame } from 'lucide-react';

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
    if (rank === 1) return <span className="text-xl">🥇</span>;
    if (rank === 2) return <span className="text-xl">🥈</span>;
    if (rank === 3) return <span className="text-xl">🥉</span>;
    return (
      <span className="w-6 h-6 rounded-full bg-muted font-bold text-xs flex items-center justify-center text-muted-foreground">
        #{rank}
      </span>
    );
  };

  return (
    <section className="py-20 md:py-28 bg-canvas">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <Badge variant="default" className="text-xs uppercase font-bold tracking-wider">
            <Trophy className="w-3.5 h-3.5 mr-1 text-amber-500" />
            Live National Standings
          </Badge>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Campus Leaderboard Preview
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Colleges across India are rallying their final-year batches. Which college will dominate the top spot?
          </p>
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-12"
        >
          <Card className="shadow-sm border-border overflow-hidden">
            <CardHeader className="bg-canvas-soft border-b border-border/80 flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Top Engineering Campuses
                </CardTitle>
                <CardDescription className="text-xs">
                  Updated live every 30 seconds
                </CardDescription>
              </div>
              {totalRegistrations > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 fill-primary" />
                  <span>{totalRegistrations} Registered Nationwide</span>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-0 divide-y divide-border/60">
              {isLoading ? (
                // Loading Skeleton
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-muted"></div>
                        <div className="h-4 w-48 bg-muted rounded"></div>
                      </div>
                      <div className="h-4 w-12 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : topCampuses.length > 0 ? (
                topCampuses.map((campus) => (
                  <div
                    key={campus.collegeId}
                    className="flex items-center justify-between p-4 sm:px-6 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-7 flex items-center justify-center shrink-0">
                        {renderRankBadge(campus.rank)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm sm:text-base text-foreground truncate">
                          {campus.collegeName}
                        </p>
                        {(campus.city || campus.state) && (
                          <p className="text-xs text-muted-foreground truncate">
                            {[campus.city, campus.state].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-4">
                      <span className="font-extrabold text-sm sm:text-base text-primary">
                        {campus.registrations}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">students</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  <p>Be the first from your college to register and put your campus on the leaderboard!</p>
                </div>
              )}
            </CardContent>

            <CardFooter className="bg-canvas-soft/80 border-t border-border/80 flex items-center justify-between p-4">
              <span className="text-xs text-muted-foreground">
                Represent your campus in the AI Workshop challenge
              </span>
              <Link to="/leaderboard">
                <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary-deep text-xs font-semibold">
                  <span>View Full Leaderboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default CampusLeaderboardPreview;
