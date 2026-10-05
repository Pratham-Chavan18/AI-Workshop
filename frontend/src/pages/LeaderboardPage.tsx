import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import SiteHeader from '@/components/layout/site-header';
import SiteFooter from '@/components/layout/site-footer';
import CampusLeaderboard from '@/components/leaderboard/campus-leaderboard';
import ReferrerLeaderboard from '@/components/leaderboard/referrer-leaderboard';
import { Sticker } from '@/components/slush/sticker';
import { Trophy, Users, ArrowUpRight, Flame, Building2 } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-slush-concrete text-black antialiased">
      <SiteHeader />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Sticker
            color="sunburst"
            icon={<Trophy className="w-4 h-4 text-black" />}
            label="NATIONAL CAMPUS STANDINGS"
            className="mb-4"
          />

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold font-display tracking-tight text-black uppercase leading-[0.82] select-none">
            CAMPUS CHALLENGE
            <br />
            <span className="text-black">LEADERBOARD</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-neutral-800 font-medium">
            500 verified seats nationwide. Live rankings update automatically as student batches register.
          </p>

          {/* Goal Progress Tracker - Slush Elevated Card */}
          <div className="mt-8 p-6 bg-white border border-black rounded-[28px] max-w-xl mx-auto text-left">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide mb-2">
              <span className="flex items-center gap-1.5 text-black">
                <Flame className="w-4 h-4 text-slush-ember" />
                Target: 500 Verified Seats
              </span>
              <span className="text-black font-extrabold">{progressPercent}% Filled</span>
            </div>

            {/* Custom Slush Progress Bar */}
            <div className="w-full h-4 bg-slush-mist border border-black rounded-full overflow-hidden p-0.5">
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-slush-mint rounded-full border-r border-black transition-all duration-500"
              />
            </div>

            <div className="flex justify-between items-center text-xs font-bold text-neutral-700 mt-2">
              <span>{totalRegistrations} Students Registered</span>
              <span>{Math.max(targetGoal - totalRegistrations, 0)} Seats Remaining</span>
            </div>
          </div>

          {/* Segmented Pill Tab Switcher */}
          <div className="mt-8 inline-flex p-1 bg-white rounded-pill border border-black gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('campuses')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-pill text-xs sm:text-sm font-bold tracking-[0.03em] transition-all cursor-pointer ${
                activeTab === 'campuses'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-slush-mist'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Campus Rankings</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('referrers')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-pill text-xs sm:text-sm font-bold tracking-[0.03em] transition-all cursor-pointer ${
                activeTab === 'referrers'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-slush-mist'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Top Student Referrers</span>
            </button>
          </div>
        </div>

        {/* Tab Panels */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'campuses' ? (
            <CampusLeaderboard />
          ) : (
            <ReferrerLeaderboard />
          )}

          {/* Bottom CTA to Register */}
          <div className="mt-12 text-center p-8 bg-slush-sky border border-black rounded-[28px] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h3 className="font-display font-extrabold text-2xl text-black uppercase">
                Don't see your college at the top?
              </h3>
              <p className="text-sm text-neutral-700 font-medium">
                Register now, grab your referral link, and rally your classmates to claim the #1 spot.
              </p>
            </div>
            <Link to="/register" className="shrink-0 w-full sm:w-auto">
              <button className="slush-pill px-8 py-3.5 bg-black text-white hover:bg-neutral-800 text-sm font-bold flex items-center justify-center gap-2 w-full sm:w-auto">
                <span>Represent My College</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default LeaderboardPage;
