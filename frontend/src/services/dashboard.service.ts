import { api } from '@/lib/api';

export interface ReferralStats {
  referralCode: string;
  referralUrl: string;
  referralCount: number;
  goal: number;
  campusRank: number | null;
  student?: {
    id: string;
    fullName: string;
    email: string;
    collegeId: string;
  };
}

export async function getMyDashboardStats(): Promise<ReferralStats> {
  const res = await api.get<ReferralStats>('/users/me/dashboard');
  return res.data;
}

export async function getReferralStats(userId?: string): Promise<ReferralStats> {
  if (!userId) {
    return getMyDashboardStats();
  }
  const res = await api.get<ReferralStats>(`/users/${userId}/referrals`);
  return res.data;
}

export async function logoutStudent(): Promise<void> {
  await api.post('/users/logout');
}

