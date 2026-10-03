import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
    return "🏆 You're an official AI 60×500 Campus Ambassador! Priority Q&A unlocked.";
  };

  return (
    <Card className="h-full border-border/80 bg-card/95 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge
            variant={isAmbassador ? 'success' : 'default'}
            className="text-xs uppercase font-bold tracking-wider"
          >
            {isAmbassador ? (
              <>
                <Award className="w-3.5 h-3.5 mr-1" />
                Ambassador Unlocked
              </>
            ) : (
              <>
                <Target className="w-3.5 h-3.5 mr-1" />
                Referral Challenge
              </>
            )}
          </Badge>

          {campusRank && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold border border-amber-500/20">
              <Trophy className="w-3.5 h-3.5" />
              <span>Campus Rank #{campusRank}</span>
            </div>
          )}
        </div>

        <CardTitle className="text-xl sm:text-2xl font-bold mt-2">
          Your Referral Progress
        </CardTitle>
        <CardDescription className="text-sm">
          Track friends who registered through your link in real time.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Big Counter & Progress Bar */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-foreground">{referralCount}</span>
              <span className="text-lg font-semibold text-muted-foreground">/ {goal}</span>
              <span className="text-xs text-muted-foreground ml-2">Friends Joined</span>
            </div>
            <span className="text-sm font-bold text-primary">{percentage}%</span>
          </div>

          <Progress value={percentage} className="h-3" />
        </div>

        {/* Milestone Card */}
        <div className={`p-4 rounded-2xl border ${
          isAmbassador
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
            : 'bg-muted/50 border-border text-foreground'
        }`}>
          <div className="flex items-start gap-3">
            {isAmbassador ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Flame className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Current Status
              </p>
              <p className="text-sm font-medium mt-0.5 leading-snug">
                {getMilestoneMessage()}
              </p>
            </div>
          </div>
        </div>

        {/* Perks Checklist */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <p className="text-xs font-bold text-foreground uppercase tracking-wider">
            Ambassador Perks (3+ Referrals)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className={referralCount >= 1 ? 'text-emerald-500' : 'text-muted-foreground/50'}>✓</span>
              <span>1 Referral: Campus Leaderboard Credit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={referralCount >= 2 ? 'text-emerald-500' : 'text-muted-foreground/50'}>✓</span>
              <span>2 Referrals: AI Starter Codebase</span>
            </div>
            <div className="flex items-center gap-1.5 sm:col-span-2">
              <span className={referralCount >= 3 ? 'text-emerald-500' : 'text-muted-foreground/50'}>✓</span>
              <span className="font-semibold text-foreground">3 Referrals: Verified Ambassador Badge & Priority Q&A</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralProgressCard;
