import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import SiteHeader from '@/components/layout/site-header';
import SiteFooter from '@/components/layout/site-footer';
import KPICards from '@/components/admin/kpi-cards';
import RegistrationChart from '@/components/admin/registration-chart';
import ReferralSourceTable from '@/components/admin/referral-source-table';
import AmbassadorTable from '@/components/admin/ambassador-table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, KeyRound, Download, RefreshCw, LogOut, AlertCircle, Loader2 } from 'lucide-react';

const ADMIN_STORAGE_KEY = 'ai60_admin_api_key';

export const AdminPage: React.FC = () => {
  const [adminKey, setAdminKey] = useState<string>(() => {
    return sessionStorage.getItem(ADMIN_STORAGE_KEY) || '';
  });
  const [keyInput, setKeyInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    document.title = 'Admin Analytics Dashboard | AI 60×500 | NxtWave';
  }, []);

  // 1. Fetch active campaign ID
  const { data: campaignData } = useQuery({
    queryKey: ['admin', 'activeCampaign'],
    queryFn: async () => {
      const res = await axios.get('/api/v1/campaigns/active');
      return res.data.campaign;
    },
  });

  const campaignId = campaignData?.id;

  // 2. Fetch campaign stats with X-Admin-Key header
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['admin', 'stats', campaignId, adminKey],
    queryFn: async () => {
      const res = await axios.get(`/api/v1/admin/campaigns/${campaignId}/stats`, {
        headers: { 'X-Admin-Key': adminKey },
      });
      return res.data;
    },
    enabled: !!adminKey && !!campaignId,
    retry: false,
    refetchInterval: 30_000,
  });

  // 3. Fetch daily trend
  const { data: dailyTrends = [] } = useQuery({
    queryKey: ['admin', 'daily', campaignId, adminKey],
    queryFn: async () => {
      const res = await axios.get(`/api/v1/admin/campaigns/${campaignId}/stats/daily`, {
        headers: { 'X-Admin-Key': adminKey },
      });
      return res.data;
    },
    enabled: !!adminKey && !!campaignId && !statsError,
  });

  // 4. Fetch source breakdown
  const { data: sources = [] } = useQuery({
    queryKey: ['admin', 'sources', campaignId, adminKey],
    queryFn: async () => {
      const res = await axios.get(`/api/v1/admin/campaigns/${campaignId}/stats/sources`, {
        headers: { 'X-Admin-Key': adminKey },
      });
      return res.data;
    },
    enabled: !!adminKey && !!campaignId && !statsError,
  });

  // 5. Fetch ambassadors (top referrers)
  const { data: ambassadorsData } = useQuery({
    queryKey: ['admin', 'ambassadors', campaignId],
    queryFn: async () => {
      const res = await axios.get('/api/v1/leaderboard/referrers?limit=20');
      return res.data;
    },
    enabled: !!adminKey && !statsError,
  });

  const ambassadors = ambassadorsData?.items || [];

  // Check for 401/403 errors and reset key
  useEffect(() => {
    if (statsError) {
      const axiosErr = statsError as any;
      if (axiosErr.response?.status === 401 || axiosErr.response?.status === 403) {
        sessionStorage.removeItem(ADMIN_STORAGE_KEY);
        setAdminKey('');
        setAuthError('Authentication failed: Invalid admin key provided. Please verify your credentials.');
      }
    }
  }, [statsError]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    setAuthError(null);
    sessionStorage.setItem(ADMIN_STORAGE_KEY, keyInput.trim());
    setAdminKey(keyInput.trim());
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    setAdminKey('');
    setKeyInput('');
  };

  const handleExportCsv = async () => {
    if (!campaignId || !adminKey) return;
    setIsExporting(true);
    try {
      const res = await axios.get(`/api/v1/admin/campaigns/${campaignId}/export?format=csv`, {
        headers: { 'X-Admin-Key': adminKey },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ai60-registrations-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download CSV export. Please check your credentials.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink antialiased">
      <SiteHeader />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* If Not Authenticated: Show Key Gate Form */}
        {!adminKey ? (
          <div className="max-w-md mx-auto py-16">
            <Card className="shadow-lg border-border/80 bg-card">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-3">
                  <Shield className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl font-bold">Admin Operator Portal</CardTitle>
                <CardDescription className="text-xs mt-1 text-muted-foreground">
                  Enter your secure X-Admin-Key to unlock real-time campaign performance analytics and data export.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  {authError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2 text-xs text-rose-600 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Admin API Key
                    </label>
                    <div className="relative">
                      <Input
                        type="password"
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        placeholder="Enter secure key (e.g. nxtwave-...)"
                        className="pl-9 font-mono text-sm"
                        autoFocus
                      />
                      <KeyRound className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
                    </div>
                  </div>

                  <Button type="submit" variant="primary" className="w-full h-11 text-sm font-semibold">
                    Authenticate & Access Dashboard
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Authenticated Dashboard View */
          <div className="space-y-8">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-[11px] font-bold">
                    Campaign Live
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    ID: {campaignId || 'ai60-active'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
                  AI 60 × 500 Campaign Command Center
                </h1>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchStats()}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleExportCsv}
                  disabled={isExporting}
                  className="gap-1.5 text-xs font-semibold bg-primary"
                >
                  {isExporting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Export CSV</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-xs text-muted-foreground hover:text-rose-500 gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>

            {/* KPI Cards Row */}
            {isLoadingStats ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-muted/60 rounded-card border border-border" />
                ))}
              </div>
            ) : stats ? (
              <KPICards
                registrations={stats.registrations}
                target={stats.target}
                goalProgress={stats.goalProgress}
                referralRegistrations={stats.referralRegistrations}
                referralRate={stats.referralRate}
                activeCampuses={stats.activeCampuses}
              />
            ) : null}

            {/* Charts & Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Trend Chart (2 Cols) */}
              <div className="lg:col-span-2">
                <RegistrationChart data={dailyTrends} />
              </div>

              {/* Acquisition Channels (1 Col) */}
              <div>
                <ReferralSourceTable
                  sources={sources}
                  totalRegistrations={stats?.registrations || 0}
                />
              </div>
            </div>

            {/* Ambassador Table */}
            <div>
              <AmbassadorTable ambassadors={ambassadors} />
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
};

export default AdminPage;
