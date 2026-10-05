import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import SiteHeader from '@/components/layout/site-header';
import SiteFooter from '@/components/layout/site-footer';
import KPICards from '@/components/admin/kpi-cards';
import RegistrationChart from '@/components/admin/registration-chart';
import ReferralSourceTable from '@/components/admin/referral-source-table';
import AmbassadorTable from '@/components/admin/ambassador-table';
import {
  AdminUser,
  adminLogin,
  adminLogout,
  getAdminMe,
  getAdminStats,
  getDailyTrends,
  getSourceBreakdown,
  exportCampaignCsv,
} from '@/services/admin.service';
import { Shield, Lock, Mail, Download, RefreshCw, LogOut, AlertCircle, Loader2 } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    document.title = 'Admin Analytics Dashboard | AI Workshop | NxtWave';
  }, []);

  // Check for active admin session on mount
  useEffect(() => {
    getAdminMe()
      .then((user) => setAdmin(user))
      .catch(() => setAdmin(null));
  }, []);

  // 1. Fetch active campaign ID
  const { data: campaignData } = useQuery({
    queryKey: ['admin', 'activeCampaign'],
    queryFn: async () => {
      const res = await api.get('/campaigns/active');
      return res.data.campaign;
    },
  });

  const campaignId = campaignData?.id;

  // 2. Fetch campaign stats via secure session cookie
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['admin', 'stats', campaignId, admin?.id],
    queryFn: () => getAdminStats(campaignId!),
    enabled: !!admin && !!campaignId,
    retry: false,
    refetchInterval: 30_000,
  });

  // 3. Fetch daily trend
  const { data: dailyTrends = [] } = useQuery({
    queryKey: ['admin', 'daily', campaignId, admin?.id],
    queryFn: () => getDailyTrends(campaignId!, 7),
    enabled: !!admin && !!campaignId && !statsError,
  });

  // 4. Fetch source breakdown
  const { data: sources = [] } = useQuery({
    queryKey: ['admin', 'sources', campaignId, admin?.id],
    queryFn: () => getSourceBreakdown(campaignId!),
    enabled: !!admin && !!campaignId && !statsError,
  });

  // 5. Fetch ambassadors (top referrers)
  const { data: ambassadorsData } = useQuery({
    queryKey: ['admin', 'ambassadors', campaignId],
    queryFn: async () => {
      const res = await api.get('/leaderboard/referrers?limit=20');
      return res.data;
    },
    enabled: !!admin && !statsError,
  });

  const ambassadors = ambassadorsData?.items || [];

  // Handle unauthorized session expiration
  useEffect(() => {
    if (statsError) {
      const axiosErr = statsError as any;
      if (axiosErr.response?.status === 401 || axiosErr.response?.status === 403) {
        setAdmin(null);
        setAuthError('Your session has expired. Please log in again.');
      }
    }
  }, [statsError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput) return;
    setAuthError(null);
    setIsLoggingIn(true);
    try {
      const user = await adminLogin(emailInput.trim(), passwordInput);
      setAdmin(user);
      setPasswordInput('');
    } catch (err: any) {
      setAuthError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await adminLogout();
    } catch (e) {
      // safe fallback
    } finally {
      setAdmin(null);
      setEmailInput('');
      setPasswordInput('');
      queryClient.clear();
    }
  };

  const handleExportCsv = async () => {
    if (!campaignId || !admin) return;
    if (admin.role === 'viewer') {
      alert('Your account role (Viewer) has read-only permissions and cannot export data.');
      return;
    }
    setIsExporting(true);
    try {
      const blob = await exportCampaignCsv(campaignId);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `ai-workshop-registrations-${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      let serverMessage: string | null = null;
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          serverMessage = parsed.error?.message || parsed.message || null;
        } catch {
          // not JSON, fallback to err.message
        }
      } else if (err.response?.data?.error?.message) {
        serverMessage = err.response.data.error.message;
      } else if (err.response?.data?.message) {
        serverMessage = err.response.data.message;
      }
      alert(serverMessage || err.message || 'Failed to download CSV export. Please check your role permissions.');
    } finally {
      setIsExporting(false);
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    if (role === 'admin') return 'bg-slush-sunburst text-black';
    if (role === 'operator') return 'bg-slush-mint text-black';
    return 'bg-slush-mist text-neutral-800';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slush-concrete text-black antialiased">
      <SiteHeader />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* If Not Authenticated: Show Secure Session Login Form */}
        {!admin ? (
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
                  Sign in with verified administrator credentials to access real-time campaign performance analytics and data export.
                </p>
              </div>

              <div className="p-6 sm:p-8 bg-white">
                <form onSubmit={handleLogin} className="space-y-4">
                  {authError && (
                    <div
                      role="alert"
                      aria-live="polite"
                      className="p-3 bg-slush-ember text-white border border-black rounded-[18px] flex items-start gap-2 text-xs font-bold"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-black uppercase tracking-wider block">
                      Admin Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="admin@aiworkshop.nxtwave.com"
                        className="w-full h-11 pl-10 pr-4 text-sm border border-black rounded-pill bg-white focus:outline-none focus:ring-2 focus:ring-slush-electric"
                        autoFocus
                      />
                      <Mail className="w-4 h-4 text-black absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-black uppercase tracking-wider block">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full h-11 pl-10 pr-4 text-sm border border-black rounded-pill bg-white focus:outline-none focus:ring-2 focus:ring-slush-electric"
                      />
                      <Lock className="w-4 h-4 text-black absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="slush-pill w-full h-12 bg-black text-white hover:bg-neutral-800 text-sm font-bold tracking-[0.03em] flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer disabled:opacity-50"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <span>Sign In & Access Dashboard</span>
                    )}
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
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="slush-pill px-3 py-0.5 bg-slush-mint text-black text-xs font-bold">
                    Campaign Live
                  </span>
                  <span
                    className={`slush-pill px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${getRoleBadgeStyle(
                      admin.role
                    )}`}
                  >
                    Role: {admin.role}
                  </span>
                  <span className="text-xs text-neutral-600 font-mono font-bold">
                    {admin.email}
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
                  className="slush-pill px-4 py-2 bg-white text-black hover:bg-slush-mist text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>

                {admin.role !== 'viewer' ? (
                  <button
                    onClick={handleExportCsv}
                    disabled={isExporting}
                    className="slush-pill px-4 py-2 bg-slush-sunburst text-black hover:bg-slush-sunburst/80 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isExporting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>Export CSV</span>
                  </button>
                ) : (
                  <span
                    title="Export restricted to Operator and Admin roles"
                    className="slush-pill px-4 py-2 bg-neutral-200 text-neutral-500 text-xs font-bold flex items-center gap-1.5 cursor-not-allowed"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export (Restricted)</span>
                  </span>
                )}

                <button
                  onClick={handleLogout}
                  className="slush-pill px-4 py-2 bg-white text-black hover:bg-slush-ember hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
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
                registrations={stats.registrations ?? 0}
                target={stats.target ?? 500}
                goalProgress={stats.goalProgress ?? stats.conversionRate ?? 0}
                referralRegistrations={stats.referralRegistrations ?? stats.referrals ?? 0}
                referralRate={stats.referralRate ?? stats.conversionRate ?? 0}
                activeCampuses={stats.activeCampuses ?? stats.collegesCount ?? 0}
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
