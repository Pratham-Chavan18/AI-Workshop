import React from 'react';
import { Users, Target, Share2, Building2 } from 'lucide-react';

export interface KPICardsProps {
  registrations?: number;
  target?: number;
  goalProgress?: number;
  referralRegistrations?: number;
  referralRate?: number;
  activeCampuses?: number;
}

export const KPICards: React.FC<KPICardsProps> = ({
  registrations = 0,
  target = 500,
  goalProgress = 0,
  referralRegistrations = 0,
  referralRate = 0,
  activeCampuses = 0,
}) => {
  const safeRegistrations = registrations ?? 0;
  const safeTarget = target ?? 500;
  const safeGoalProgress = goalProgress ?? 0;
  const safeReferralRegs = referralRegistrations ?? 0;
  const safeReferralRate = referralRate ?? 0;
  const safeActiveCampuses = activeCampuses ?? 0;

  const cards = [
    {
      title: 'Total Registrations',
      value: safeRegistrations.toLocaleString(),
      subtext: `Goal: ${safeTarget} students`,
      icon: Users,
      badgeColor: 'bg-slush-sky text-black',
    },
    {
      title: 'Goal Progress',
      value: `${safeGoalProgress}%`,
      subtext: `${Math.max(safeTarget - safeRegistrations, 0)} spots remaining`,
      icon: Target,
      badgeColor: 'bg-slush-mint text-black',
    },
    {
      title: 'Referral Rate',
      value: `${safeReferralRate}%`,
      subtext: `${safeReferralRegs} via referral link`,
      icon: Share2,
      badgeColor: 'bg-slush-sunburst text-black',
    },
    {
      title: 'Active Campuses',
      value: safeActiveCampuses.toString(),
      subtext: 'Engineering institutions represented',
      icon: Building2,
      badgeColor: 'bg-slush-lavender text-black',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className="slush-card p-6 bg-white border border-black flex flex-col justify-between shadow-none">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-neutral-600">
                {c.title}
              </span>
              <div className={`w-9 h-9 rounded-[14px] border border-black ${c.badgeColor} flex items-center justify-center font-bold`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="font-display font-extrabold text-4xl text-black tracking-tight leading-none">
                {c.value}
              </div>
              <p className="text-xs text-neutral-600 font-medium mt-1.5">
                {c.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KPICards;
