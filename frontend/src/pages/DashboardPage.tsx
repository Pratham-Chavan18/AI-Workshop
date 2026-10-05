import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SiteHeader from '@/components/layout/site-header';
import SiteFooter from '@/components/layout/site-footer';
import ReferralProgressCard from '@/components/student/referral-progress-card';
import ReferralShareCard from '@/components/student/referral-share-card';
import { getMyDashboardStats } from '@/services/dashboard.service';
import { CheckCircle2, Trophy, ArrowUpRight, RefreshCw, AlertCircle } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  useEffect(() => {
    document.title = 'Your Referral Dashboard | AI Workshop | NxtWave';
  }, []);

  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['student-dashboard-me'],
    queryFn: () => getMyDashboardStats(),
    refetchInterval: 30_000,
    retry: 1,
  });

  const referralCode = stats?.referralCode || initialCode;
  const referralUrl =
    stats?.referralUrl || (referralCode ? `${window.location.origin}/register?ref=${referralCode}` : '');
  const referralCount = stats?.referralCount ?? 0;
  const goal = stats?.goal ?? 3;
  const campusRank = stats?.campusRank ?? null;

  return (
    <div className="min-h-screen flex flex-col bg-slush-sky text-black antialiased">
      <SiteHeader />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Slush Confirmation Banner in Mint Pop #55db9c */}
        <div className="mb-8 p-6 bg-slush-mint border border-black rounded-[28px] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full border border-black bg-white text-black flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-black uppercase leading-tight">
                You're Registered for AI Workshop! 🎉
              </h1>
              <p className="text-xs sm:text-sm text-neutral-800 font-medium mt-0.5">
                We've reserved your free seat for <span className="font-bold text-black">Build Your First AI Project in 60 Minutes</span>.
              </p>
            </div>
          </div>

          <Link
            to="/leaderboard"
            className="slush-pill px-5 py-2.5 bg-white text-black hover:bg-slush-mist text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition-all shrink-0"
          >
            <Trophy className="w-4 h-4 text-black" />
            <span>Campus Standings</span>
          </Link>
        </div>

        {/* Main Dashboard Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
            <div className="h-80 bg-white/70 rounded-[28px] border border-black"></div>
            <div className="h-80 bg-white/70 rounded-[28px] border border-black"></div>
          </div>
        ) : error ? (
          <div className="p-8 bg-white border border-black rounded-[28px] text-center max-w-md mx-auto space-y-4">
            <AlertCircle className="w-10 h-10 text-slush-ember mx-auto" />
            <h3 className="font-display font-extrabold text-2xl text-black uppercase">
              Dashboard Session Expired
            </h3>
            <p className="text-xs text-neutral-600 font-medium">
              Please register or refresh your session to view your live referral dashboard.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => refetch()}
                className="slush-pill px-5 py-2.5 bg-black text-white hover:bg-neutral-800 text-xs font-bold inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
              <Link
                to="/register"
                className="slush-pill px-5 py-2.5 bg-white text-black hover:bg-slush-mist text-xs font-bold inline-flex items-center border border-black"
              >
                <span>Register</span>
              </Link>
            </div>
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
          <Link
            to="/leaderboard"
            className="slush-pill px-8 py-3.5 bg-white text-black hover:bg-slush-mist text-sm font-bold inline-flex items-center gap-2 transition-transform hover:-translate-y-0.5"
          >
            <span>View Full Campus Leaderboard & Top Referrers</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default DashboardPage;
