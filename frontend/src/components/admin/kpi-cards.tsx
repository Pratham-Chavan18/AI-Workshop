import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Target, Share2, Building2 } from 'lucide-react';

export interface KPICardsProps {
  registrations: number;
  target: number;
  goalProgress: number;
  referralRegistrations: number;
  referralRate: number;
  activeCampuses: number;
}

export const KPICards: React.FC<KPICardsProps> = ({
  registrations,
  target,
  goalProgress,
  referralRegistrations,
  referralRate,
  activeCampuses,
}) => {
  const cards = [
    {
      title: 'Total Registrations',
      value: registrations.toLocaleString(),
      subtext: `Goal: ${target} students`,
      icon: Users,
      color: 'text-primary bg-primary/10 border-primary/20',
    },
    {
      title: 'Goal Progress',
      value: `${goalProgress}%`,
      subtext: `${Math.max(target - registrations, 0)} spots remaining`,
      icon: Target,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Referral Rate',
      value: `${referralRate}%`,
      subtext: `${referralRegistrations} through referrals`,
      icon: Share2,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Active Campuses',
      value: activeCampuses.toString(),
      subtext: 'Engineering institutions represented',
      icon: Building2,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <Card key={i} className="border-border/80 bg-card shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                {c.title}
              </CardTitle>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${c.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-foreground tracking-tight">
                {c.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {c.subtext}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default KPICards;
