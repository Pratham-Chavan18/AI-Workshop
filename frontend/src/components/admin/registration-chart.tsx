import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export interface DailyTrendItem {
  date: string;
  count: number;
}

export interface RegistrationChartProps {
  data: DailyTrendItem[];
}

export const RegistrationChart: React.FC<RegistrationChartProps> = ({ data }) => {
  const formattedData = data.map((d) => ({
    ...d,
    formattedDate: d.date ? d.date.split('-').slice(1).join('/') : '',
  }));

  return (
    <Card className="border-border/80 bg-card shadow-xs">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Daily Verified Registrations
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Acquisition volume over the past 7 days (IST)
        </p>
      </CardHeader>
      <CardContent className="h-64 sm:h-72 pt-2">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(206, 208, 212, 0.4)" />
              <XAxis
                dataKey="formattedDate"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#8595a4' }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#8595a4' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '0.75rem',
                  border: '1px solid #ced0d4',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                labelStyle={{ fontWeight: 'bold', color: '#1c1e21' }}
              />
              <Bar dataKey="count" fill="#0064e0" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
            No registration trend data available yet for this period.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RegistrationChart;
