import { prisma } from '../lib/prisma';
import { notFound, validationError } from '../utils/errors';

export interface CampaignStatsResult {
  target: number;
  registrations: number;
  referralRegistrations: number;
  referrals?: number;
  activeCampuses: number;
  collegesCount?: number;
  referralRate: number;
  conversionRate?: number;
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
    referrals: referralRegistrations,
    activeCampuses,
    collegesCount: activeCampuses,
    referralRate,
    conversionRate: referralRate,
    goalProgress,
  };
}

/**
 * Retrieves daily registration trend parameterized by the requested number of days (1-90).
 */
export async function getDailyRegistrationTrend(
  campaignId: string,
  days = 7
): Promise<DailyTrendItem[]> {
  const validDays = Math.max(1, Math.min(90, Math.floor(days)));

  try {
    const rows = await prisma.$queryRaw<Array<{ date: string; count: bigint | number }>>`
      SELECT
        TO_CHAR("createdAt" AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD') as date,
        COUNT(*)::int as count
      FROM "User"
      WHERE "campaignId" = ${campaignId}
        AND "createdAt" >= NOW() - (${validDays} * INTERVAL '1 day')
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

/**
 * Retrieves a bounded batch of registration export items to prevent unbounded memory consumption.
 */
export async function getExportDataChunk(
  campaignId: string,
  skip = 0,
  take = 500
): Promise<RegistrationExportItem[]> {
  const boundedTake = Math.min(1000, Math.max(1, take));

  const users = await prisma.user.findMany({
    where: { campaignId },
    skip,
    take: boundedTake,
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
    referralsMadeCount: u.referralsMade?.length ?? 0,
    source: u.source,
    registeredAt: u.createdAt.toISOString(),
  }));
}

export async function getTotalExportCount(campaignId: string): Promise<number> {
  return prisma.user.count({ where: { campaignId } });
}

export async function getExportData(campaignId: string): Promise<RegistrationExportItem[]> {
  return getExportDataChunk(campaignId, 0, 1000);
}
