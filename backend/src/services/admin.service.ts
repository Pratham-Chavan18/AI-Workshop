import { prisma } from '../lib/prisma';
import { notFound } from '../utils/errors';

export interface CampaignStatsResult {
  target: number;
  registrations: number;
  referralRegistrations: number;
  activeCampuses: number;
  referralRate: number;
  goalProgress: number;
}

export interface DailyTrendItem {
  date: string;
  count: number;
}

export interface SourceBreakdownItem {
  source: string;
  count: number;
}

export interface RegistrationExportItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  collegeName: string;
  collegeCity: string;
  collegeState: string;
  graduationYear: number;
  referralCode: string;
  referredByUserId: string;
  referralsMadeCount: number;
  source: string;
  registeredAt: string;
}

export async function getCampaignStats(campaignId: string): Promise<CampaignStatsResult> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { targetRegistrations: true },
  });

  if (!campaign) {
    throw notFound('Campaign not found');
  }

  const [totalRegistrations, referralRegistrations, collegeGroups] = await Promise.all([
    prisma.user.count({ where: { campaignId } }),
    prisma.referral.count({ where: { campaignId, status: 'valid' } }),
    prisma.user.groupBy({
      by: ['collegeId'],
      where: { campaignId },
      _count: { id: true },
    }),
  ]);

  const target = campaign.targetRegistrations || 500;
  const activeCampuses = collegeGroups.length;
  const goalProgress = target > 0 ? Math.round((totalRegistrations / target) * 100) : 0;
  const referralRate =
    totalRegistrations > 0
      ? Math.round((referralRegistrations / totalRegistrations) * 10000) / 100
      : 0;

  return {
    target,
    registrations: totalRegistrations,
    referralRegistrations,
    activeCampuses,
    referralRate,
    goalProgress,
  };
}

export async function getDailyRegistrationTrend(
  campaignId: string,
  days = 7
): Promise<DailyTrendItem[]> {
  try {
    const rows = await prisma.$queryRaw<Array<{ date: string; count: bigint | number }>>`
      SELECT
        TO_CHAR("createdAt" AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD') as date,
        COUNT(*)::int as count
      FROM "User"
      WHERE "campaignId" = ${campaignId}
        AND "createdAt" >= NOW() - INTERVAL '7 days'
      GROUP BY TO_CHAR("createdAt" AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD')
      ORDER BY date ASC
    `;

    return rows.map((r) => ({
      date: r.date,
      count: Number(r.count),
    }));
  } catch (err) {
    return [];
  }
}

export async function getSourceBreakdown(campaignId: string): Promise<SourceBreakdownItem[]> {
  const groups = await prisma.user.groupBy({
    by: ['source'],
    where: { campaignId },
    _count: { id: true },
  });

  return groups.map((g) => ({
    source: g.source,
    count: g._count.id,
  }));
}

export async function getExportData(campaignId: string): Promise<RegistrationExportItem[]> {
  const users = await prisma.user.findMany({
    where: { campaignId },
    include: {
      college: {
        select: {
          name: true,
          city: true,
          state: true,
        },
      },
      referralsMade: {
        where: { status: 'valid' },
        select: { id: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return users.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone || '',
    collegeName: u.college.name,
    collegeCity: u.college.city || '',
    collegeState: u.college.state || '',
    graduationYear: u.graduationYear,
    referralCode: u.referralCode,
    referredByUserId: u.referredByUserId || '',
    referralsMadeCount: u.referralsMade.length,
    source: u.source,
    registeredAt: u.createdAt.toISOString(),
  }));
}
