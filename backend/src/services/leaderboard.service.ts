import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export interface CampusLeaderboardItem {
  rank: number;
  collegeId: string;
  collegeName: string;
  city?: string | null;
  state?: string | null;
  registrations: number;
}

export interface ReferrerLeaderboardItem {
  rank: number;
  userId: string;
  fullName: string;
  collegeName: string;
  referralCount: number;
}

export async function getCampusLeaderboard(
  campaignId: string,
  limit = 50
): Promise<CampusLeaderboardItem[]> {
  const rows = await prisma.$queryRaw<
    Array<{
      rank: bigint | number;
      collegeId: string;
      collegeName: string;
      city: string | null;
      state: string | null;
      registrations: bigint | number;
    }>
  >`
    SELECT
      ROW_NUMBER() OVER (ORDER BY COUNT(u.id) DESC, c.name ASC)::int as rank,
      c.id as "collegeId",
      c.name as "collegeName",
      c.city,
      c.state,
      COUNT(u.id)::int as "registrations"
    FROM "College" c
    INNER JOIN "User" u ON u."collegeId" = c.id
    WHERE u."campaignId" = ${campaignId}
    GROUP BY c.id, c.name, c.city, c.state
    ORDER BY "registrations" DESC, c.name ASC
    LIMIT ${limit}
  `;

  return rows.map((r) => ({
    rank: Number(r.rank),
    collegeId: r.collegeId,
    collegeName: r.collegeName,
    city: r.city,
    state: r.state,
    registrations: Number(r.registrations),
  }));
}

export async function getRegistrationCount(campaignId: string): Promise<number> {
  return prisma.user.count({
    where: { campaignId },
  });
}

export async function getReferrerLeaderboard(
  campaignId: string,
  limit = 50
): Promise<ReferrerLeaderboardItem[]> {
  const rows = await prisma.$queryRaw<
    Array<{
      rank: bigint | number;
      userId: string;
      fullName: string;
      collegeName: string;
      referralCount: bigint | number;
    }>
  >`
    SELECT
      ROW_NUMBER() OVER (ORDER BY COUNT(r.id) DESC, u."createdAt" ASC)::int as rank,
      u.id as "userId",
      u."fullName",
      c.name as "collegeName",
      COUNT(r.id)::int as "referralCount"
    FROM "User" u
    INNER JOIN "College" c ON c.id = u."collegeId"
    LEFT JOIN "Referral" r ON r."referrerUserId" = u.id AND r.status = 'valid'
    WHERE u."campaignId" = ${campaignId}
    GROUP BY u.id, u."fullName", c.name, u."createdAt"
    HAVING COUNT(r.id) > 0
    ORDER BY "referralCount" DESC, u."createdAt" ASC
    LIMIT ${limit}
  `;

  return rows.map((r) => ({
    rank: Number(r.rank),
    userId: r.userId,
    fullName: r.fullName,
    collegeName: r.collegeName,
    referralCount: Number(r.referralCount),
  }));
}
