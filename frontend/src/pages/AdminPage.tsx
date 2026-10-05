import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import SiteHeader from '@/components/layout/site-header';
import SiteFooter from '@/components/layout/site-footer';
import KPICards from '@/components/admin/kpi-cards';
import RegistrationChart from '@/components/admin/registration-chart';
import ReferralSourceTable from '@/components/admin/referral-source-table';
import AmbassadorTable from '@/components/admin/ambassador-table';
import { Shield, KeyRound, Download, RefreshCw, LogOut, AlertCircle, Loader2 } from 'lucide-react';

const ADMIN_STORAGE_KEY = 'ai_workshop_admin_api_key';

export const AdminPage: React.FC = () => {
  const [adminKey, setAdminKey] = useState<string>(() => {
    return sessionStorage.getItem(ADMIN_STORAGE_KEY) || '';
  });
  const [keyInput, setKeyInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    document.title = 'Admin Analytics Dashboard | AI Workshop | NxtWave';
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
      link.setAttribute('download', `ai-workshop-registrations-${new Date().toISOString().slice(0, 10)}.csv`);
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
    <div className="min-h-screen flex flex-col bg-slush-concrete text-black antialiased">
      <SiteHeader />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* If Not Authenticated: Show Key Gate Form */}
        {!adminKey ? (
          <div className="max-w-md mx-auto py-16">
            <div className="slush-card-elevated bg-white border border-black overflow-hidden shadow-none">
              <div className="bg-slush-lavender border-b border-black p-6 text-center">
                <div className="w-12 h-12 rounded-full border border-black bg-white flex items-center justify-center text-black mx-auto mb-3 font-bold">
                  <Shield className="w-6 h-6" />
                </div>
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-black uppercase leading-tight">
                  Admin Operator Portal
                </h1>
                <p className="text-xs sm:text-sm mt-1 text-neutral-700 font-medium">
                  Enter your secure X-Admin-Key to unlock real-time campaign performance analytics and data export.
                </p>
              </div>

              <div className="p-6 sm:p-8 bg-white">
                <form onSubmit={handleLogin} className="space-y-4">
                  {authError && (
                    <div className="p-3 bg-slush-ember text-white border border-black rounded-[18px] flex items-start gap-2 text-xs font-bold">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-black uppercase tracking-wider">
                      Admin API Key
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        placeholder="Enter secure key (e.g. nxtwave-...)"
                        className="w-full h-11 pl-10 pr-4 font-mono text-sm border border-black rounded-pill bg-white focus:outline-none focus:ring-2 focus:ring-slush-electric"
                        autoFocus
                      />
                      <KeyRound className="w-4 h-4 text-black absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="slush-pill w-full h-12 bg-black text-white hover:bg-neutral-800 text-sm font-bold tracking-[0.03em] flex items-center justify-center gap-2 transition-all mt-4"
                  >
                    Authenticate & Access Dashboard
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard View */
          <div className="space-y-8">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-black">
              <div>
                <div className="flex items-center gap-2">
                  <span className="slush-pill px-3 py-0.5 bg-slush-mint text-black text-xs font-bold">
                    Campaign Live
                  </span>
                  <span className="text-xs text-neutral-600 font-mono font-bold">
                    ID: {campaignId || 'ai-workshop-active'}
                  </span>
                </div>
                <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-black uppercase tracking-tight mt-1">
                  AI Workshop Command Center
                </h1>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <button
                  onClick={() => refetchStats()}
                  className="slush-pill px-4 py-2 bg-white text-black hover:bg-slush-mist text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={handleExportCsv}
                  disabled={isExporting}
                  className="slush-pill px-4 py-2 bg-slush-sunburst text-black hover:bg-slush-sunburst/80 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {isExporting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="slush-pill px-4 py-2 bg-white text-black hover:bg-slush-ember hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
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
