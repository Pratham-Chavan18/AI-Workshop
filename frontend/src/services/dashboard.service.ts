import { api } from '@/lib/api';

export interface ReferralStats {
  referralCode: string;
  referralUrl: string;
  referralCount: number;
  goal: number;
  campusRank: number | null;
}

export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const res = await api.get<ReferralStats>(`/users/${userId}/referrals`);
  return res.data;
}
