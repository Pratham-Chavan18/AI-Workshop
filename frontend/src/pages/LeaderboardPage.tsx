import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import SiteHeader from '@/components/layout/site-header';
import SiteFooter from '@/components/layout/site-footer';
import CampusLeaderboard from '@/components/leaderboard/campus-leaderboard';
import ReferrerLeaderboard from '@/components/leaderboard/referrer-leaderboard';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Trophy, Users, ArrowRight, Building2, Flame } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'campuses' | 'referrers'>('campuses');

  useEffect(() => {
    document.title = 'Campus Leaderboard | AI Workshop | NxtWave';
  }, []);

  const { data: totalData } = useQuery<{ total: number }>({
    queryKey: ['leaderboard', 'totalCount'],
    queryFn: async () => {
      const res = await api.get('/leaderboard/campuses?limit=1');
      return { total: res.data.total || 0 };
    },
    refetchInterval: 30_000,
  });

  const totalRegistrations = totalData?.total || 0;
  const targetGoal = 500;
  const progressPercent = Math.min(Math.round((totalRegistrations / targetGoal) * 100), 100);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink antialiased">
      <SiteHeader />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative">
        <AuroraBackground className="absolute inset-0 pointer-events-none opacity-40 -z-10" />

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <Badge variant="default" className="text-xs uppercase font-bold tracking-wider mb-3">
            <Trophy className="w-3.5 h-3.5 mr-1 text-amber-500" />
            National Campus Competition
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Campus Challenge Leaderboard
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            500 verified seats. Live national rankings updated as engineering batches sign up.
          </p>

          {/* Goal Progress Tracker */}
          <div className="mt-8 p-6 bg-card border border-border/80 rounded-2xl shadow-xs max-w-xl mx-auto">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5 text-primary">
                <Flame className="w-4 h-4 fill-primary" />
                Campaign Target: 500 Verified Seats
              </span>
              <span className="text-foreground">{progressPercent}% Achieved</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
              <span>{totalRegistrations} Registered</span>
              <span>{Math.max(targetGoal - totalRegistrations, 0)} Seats Remaining</span>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="mt-8 inline-flex p-1.5 bg-muted rounded-pill border border-border">
            <button
              type="button"
              onClick={() => setActiveTab('campuses')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-pill text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'campuses'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Campus Rankings</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('referrers')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-pill text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'referrers'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Top Referrers</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'campuses' ? (
            <CampusLeaderboard />
          ) : (
            <ReferrerLeaderboard />
          )}
        </div>

        {/* CTA Bottom Banner */}
        <div className="mt-14 p-8 bg-card border border-border rounded-2xl text-center max-w-2xl mx-auto shadow-sm">
          <h3 className="text-xl font-bold">Don't see your college at the top?</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
            Register now, share your referral code with your batch, and put your campus on the national stage!
          </p>
          <div className="mt-5">
            <Link to="/register">
              <Button size="lg" variant="primary" className="gap-2 px-8">
                <span>Register & Claim Your Free Seat</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default LeaderboardPage;
