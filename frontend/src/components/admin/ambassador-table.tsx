import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Award, Users } from 'lucide-react';

export interface AmbassadorItem {
  rank: number;
  displayName?: string;
  fullName?: string;
  collegeName: string;
  referralCount: number;
}

export interface AmbassadorTableProps {
  ambassadors: AmbassadorItem[];
}

export const AmbassadorTable: React.FC<AmbassadorTableProps> = ({ ambassadors }) => {
  return (
    <Card className="border-border/80 bg-card shadow-xs">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          Top Student Referrers
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Top campus influencers driving batch attendance
        </p>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30 uppercase tracking-wider text-muted-foreground font-bold">
              <th className="py-2.5 px-4 w-12 text-center">Rank</th>
              <th className="py-2.5 px-4">Student</th>
              <th className="py-2.5 px-4">College</th>
              <th className="py-2.5 px-4 text-right">Referrals</th>
            </tr>
          </thead>
          <tbody>
            {ambassadors.length > 0 ? (
              ambassadors.slice(0, 10).map((a) => (
                <tr key={`${a.rank}-${a.displayName || a.fullName}`} className="border-b border-border/40 hover:bg-muted/30">
                  <td className="py-3 px-4 text-center font-bold text-muted-foreground">
                    #{a.rank}
                  </td>
                  <td className="py-3 px-4 font-semibold text-foreground">
                    {a.displayName || a.fullName}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground truncate max-w-[150px]">
                    {a.collegeName}
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-primary">
                    {a.referralCount}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground">
                  <Users className="w-6 h-6 mx-auto mb-1 text-muted-foreground/40" />
                  No student ambassadors recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default AmbassadorTable;
