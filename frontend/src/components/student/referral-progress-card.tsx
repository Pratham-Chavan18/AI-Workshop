import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sticker } from '@/components/slush/sticker';
import { Trophy, Award, Target, Flame, CheckCircle2 } from 'lucide-react';

export interface ReferralProgressCardProps {
  referralCount: number;
  goal: number;
  campusRank: number | null;
}

export const ReferralProgressCard: React.FC<ReferralProgressCardProps> = ({
  referralCount,
  goal,
  campusRank,
}) => {
  const percentage = Math.min(Math.round((referralCount / goal) * 100), 100);
  const isAmbassador = referralCount >= goal;

  useEffect(() => {
    if (isAmbassador) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback if canvas not available
      }
    }
  }, [isAmbassador]);

  const getMilestoneMessage = () => {
    if (referralCount === 0) {
      return 'Share your referral link with classmates to unlock your AI Project Starter Kit!';
    }
    if (referralCount === 1) {
      return 'Awesome start! 2 more friends needed to unlock official Ambassador status 🎯';
    }
    if (referralCount === 2) {
      return 'Almost there! Just 1 more friend needed to unlock your reward pack 🔥';
    }
    return "🏆 You're an official AI Workshop Campus Ambassador! Priority Q&A unlocked.";
  };

  return (
    <div className="slush-card h-full bg-white border border-black p-6 sm:p-8 flex flex-col justify-between shadow-none">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <Sticker
            color={isAmbassador ? 'mint' : 'voltage'}
            icon={isAmbassador ? <Award className="w-3.5 h-3.5" /> : <Target className="w-3.5 h-3.5" />}
            label={isAmbassador ? 'AMBASSADOR UNLOCKED' : 'CAMPUS CHALLENGE'}
            size="sm"
          />

          {campusRank && (
            <div className="slush-pill px-3 py-1 bg-slush-sunburst text-black text-xs font-bold flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-black" />
              <span>Campus Rank #{campusRank}</span>
            </div>
          )}
        </div>

        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-black uppercase leading-none">
          Your Referral Progress
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 font-medium mt-1">
          Track classmates who joined using your link in real time.
        </p>

        {/* Big Counter & Progress Bar */}
        <div className="mt-6">
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-extrabold text-5xl text-black">{referralCount}</span>
              <span className="font-display font-extrabold text-2xl text-neutral-400">/ {goal}</span>
              <span className="text-xs text-neutral-600 font-bold ml-1">Friends Joined</span>
            </div>
            <span className="font-display font-extrabold text-2xl text-black">{percentage}%</span>
          </div>

          <div className="w-full h-4 bg-slush-mist border border-black rounded-full overflow-hidden p-0.5">
            <div
              style={{ width: `${percentage}%` }}
              className="h-full bg-slush-mint rounded-full border-r border-black transition-all duration-500"
            />
          </div>
        </div>

        {/* Milestone Card */}
        <div className={`mt-6 p-4 rounded-[20px] border border-black ${
          isAmbassador ? 'bg-slush-mint text-black' : 'bg-slush-lavender/60 text-black'
        }`}>
          <div className="flex items-start gap-3">
            {isAmbassador ? (
              <CheckCircle2 className="w-5 h-5 text-black shrink-0 mt-0.5" />
            ) : (
              <Flame className="w-5 h-5 text-slush-ember shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-black">
                Current Milestone Status
              </p>
              <p className="text-sm font-semibold mt-0.5 leading-snug">
                {getMilestoneMessage()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Perks Checklist */}
      <div className="space-y-2 pt-6 mt-6 border-t border-black/10">
        <p className="text-xs font-bold text-black uppercase tracking-wider">
          Ambassador Perks Checklist
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-neutral-700">
          <div className="flex items-center gap-1.5">
            <span className={referralCount >= 1 ? 'text-black font-extrabold' : 'text-neutral-400'}>
              {referralCount >= 1 ? '●' : '○'}
            </span>
            <span>1 Referral: Campus Leaderboard Credit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={referralCount >= 2 ? 'text-black font-extrabold' : 'text-neutral-400'}>
              {referralCount >= 2 ? '●' : '○'}
            </span>
            <span>2 Referrals: AI Starter Codebase</span>
          </div>
          <div className="flex items-center gap-1.5 sm:col-span-2">
            <span className={referralCount >= 3 ? 'text-black font-extrabold' : 'text-neutral-400'}>
              {referralCount >= 3 ? '●' : '○'}
            </span>
            <span className="font-bold text-black">3 Referrals: Verified Ambassador Badge & Priority Q&A</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralProgressCard;
