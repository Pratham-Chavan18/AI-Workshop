import { api } from '@/lib/api';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
}

export interface CampaignStats {
  registrations: number;
  target: number;
  referrals: number;
  conversionRate: number;
  collegesCount: number;
  hoursRemaining?: number;
}

export interface DailyTrendItem {
  date: string;
  count: number;
}

export interface SourceBreakdownItem {
  source: string;
  count: number;
  percentage?: number;
}

export async function adminLogin(email: string, password: string): Promise<AdminUser> {
  const res = await api.post('/admin/auth/login', { email, password });
  return res.data.admin;
}

export async function adminLogout(): Promise<void> {
  await api.post('/admin/auth/logout');
}

export async function getAdminMe(): Promise<AdminUser> {
  const res = await api.get('/admin/auth/me');
  return res.data.admin;
}

export async function getAdminStats(campaignId: string): Promise<CampaignStats> {
  const res = await api.get(`/admin/campaigns/${campaignId}/stats`);
  return res.data;
}

export async function getDailyTrends(campaignId: string, days = 7): Promise<DailyTrendItem[]> {
  const res = await api.get(`/admin/campaigns/${campaignId}/stats/daily?days=${days}`);
  return res.data;
}

export async function getSourceBreakdown(campaignId: string): Promise<SourceBreakdownItem[]> {
  const res = await api.get(`/admin/campaigns/${campaignId}/stats/sources`);
  return res.data;
}

export async function exportCampaignCsv(campaignId: string): Promise<Blob> {
  const res = await api.get(`/admin/campaigns/${campaignId}/export?format=csv`, {
    responseType: 'blob',
  });
  return res.data;
}
