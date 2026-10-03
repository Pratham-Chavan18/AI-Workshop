import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart } from 'lucide-react';

export interface SourceItem {
  source: string;
  count: number;
}

export interface ReferralSourceTableProps {
  sources: SourceItem[];
  totalRegistrations: number;
}

export const ReferralSourceTable: React.FC<ReferralSourceTableProps> = ({
  sources,
  totalRegistrations,
}) => {
  return (
    <Card className="border-border/80 bg-card shadow-xs">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <PieChart className="w-4 h-4 text-primary" />
          Acquisition Channels
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Distribution of student registrations by origin channel
        </p>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30 uppercase tracking-wider text-muted-foreground font-bold">
              <th className="py-2.5 px-4">Channel</th>
              <th className="py-2.5 px-4 text-center">Registrations</th>
              <th className="py-2.5 px-4 text-right">Share</th>
            </tr>
          </thead>
          <tbody>
            {sources.length > 0 ? (
              sources.map((s, idx) => {
                const share =
                  totalRegistrations > 0
                    ? Math.round((s.count / totalRegistrations) * 1000) / 10
                    : 0;
                return (
                  <tr key={idx} className="border-b border-border/40 hover:bg-muted/30">
                    <td className="py-3 px-4 font-semibold capitalize text-foreground">
                      {s.source === 'whatsapp' ? '📱 WhatsApp Referral' : s.source === 'direct' ? '🌐 Direct / Organic' : s.source}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-primary">
                      {s.count}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-muted-foreground">
                      {share}%
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="py-8 text-center text-muted-foreground">
                  No source data recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default ReferralSourceTable;
