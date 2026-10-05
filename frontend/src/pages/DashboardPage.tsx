import React, { useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SiteHeader from '@/components/layout/site-header';
import SiteFooter from '@/components/layout/site-footer';
import ReferralProgressCard from '@/components/student/referral-progress-card';
import ReferralShareCard from '@/components/student/referral-share-card';
import { getReferralStats } from '@/services/dashboard.service';
import { Button } from '@/components/ui/button';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { CheckCircle2, Trophy, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  useEffect(() => {
    document.title = 'Your Referral Dashboard | AI Workshop | NxtWave';
  }, []);

  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', userId],
    queryFn: () => getReferralStats(userId!),
    enabled: !!userId,
    refetchInterval: 30_000, // Live poll every 30 seconds
  });

  const referralCode = stats?.referralCode || initialCode || 'AIWCODE';
  const referralUrl =
    stats?.referralUrl || `${window.location.origin}/register?ref=${referralCode}`;
  const referralCount = stats?.referralCount ?? 0;
  const goal = stats?.goal ?? 3;
  const campusRank = stats?.campusRank ?? null;

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink antialiased">
      <SiteHeader />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative">
        <AuroraBackground className="absolute inset-0 pointer-events-none opacity-40 -z-10" />

        {/* Confirmation Banner */}
        <div className="mb-8 p-4 sm:p-6 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                You're Registered for the Free AI Workshop! 🎉
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                We've reserved your seat for <span className="font-semibold text-foreground">Build Your First AI Project in 60 Minutes</span>.
              </p>
            </div>
          </div>

          <Link to="/leaderboard" className="shrink-0">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Campus Standings</span>
            </Button>
          </Link>
        </div>

        {/* Main Dashboard Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
            <div className="h-80 bg-muted/60 rounded-card border border-border"></div>
            <div className="h-80 bg-muted/60 rounded-card border border-border"></div>
          </div>
        ) : error ? (
          <div className="p-8 bg-card border border-border rounded-card text-center max-w-md mx-auto space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold">Could not load live dashboard</h3>
            <p className="text-xs text-muted-foreground">
              We couldn't connect to fetch your referral stats right now. Please try again.
            </p>
            <Button variant="primary" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Progress Card */}
            <ReferralProgressCard
              referralCount={referralCount}
              goal={goal}
              campusRank={campusRank}
            />

            {/* Share Card */}
            <ReferralShareCard
              referralCode={referralCode}
              referralUrl={referralUrl}
              referralCount={referralCount}
              goal={goal}
            />
          </div>
        )}

        {/* Bottom CTA to Leaderboard */}
        <div className="mt-12 text-center">
          <Link to="/leaderboard">
            <Button variant="ghost" className="gap-2 text-primary hover:text-primary-deep text-sm font-semibold">
              <span>View Full Campus Leaderboard & Top Referrers</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default DashboardPage;
