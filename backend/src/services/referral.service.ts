import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { buildReferralUrl } from '../utils/referralCode';
import { notFound } from '../utils/errors';

export interface AttributionResult {
  credited: boolean;
  reason: 'attributed' | 'self_referral' | 'already_attributed' | 'invalid_params';
}

export interface ReferralStatsResult {
  referralCode: string;
  referralUrl: string;
  referralCount: number;
  goal: number;
  campusRank: number | null;
}

export async function attributeReferral(params: {
  campaignId: string;
  referrerId: string;
  referredUserId: string;
  referralCode: string;
}): Promise<AttributionResult> {
  const { campaignId, referrerId, referredUserId, referralCode } = params;

  // 1. Check self-referral
  if (referrerId === referredUserId) {
    return { credited: false, reason: 'self_referral' };
  }

  // 2. Check already attributed within this campaign
  const existingReferral =
    (await prisma.referral.findFirst({
      where: {
        referredUserId,
        campaignId,
      },
    })) ||
    (await (prisma.referral as any).findUnique?.({
      where: {
        referredUserId,
      },
    }));

  if (existingReferral) {
    return { credited: false, reason: 'already_attributed' };
  }

  // 3. Create valid referral record
  try {
    await prisma.referral.create({
      data: {
        campaignId,
        referrerUserId: referrerId,
        referredUserId,
        referralCode,
        status: 'valid',
      },
    });

    return { credited: true, reason: 'attributed' };
  } catch (err: any) {
    if (err.code === 'P2002') {
      return { credited: false, reason: 'already_attributed' };
    }
    throw err;
  }
}

export async function getReferralStats(
  userId: string,
  campaignId?: string
): Promise<ReferralStatsResult> {
  // Fetch user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      campaignId: true,
      collegeId: true,
      referralCode: true,
    },
  });

  if (!user) {
    throw notFound('Student not found');
  }

  const activeCampaignId = campaignId || user.campaignId;

  // Count valid referrals credited to this user
  const referralCount = await prisma.referral.count({
    where: {
      referrerUserId: userId,
      campaignId: activeCampaignId,
      status: 'valid',
    },
  });

  // Calculate campus rank for user's college within this campaign
  let campusRank: number | null = null;
  try {
    const rankRows = await prisma.$queryRaw<Array<{ rank: bigint | number; collegeId: string }>>`
      SELECT rank::int, "collegeId" FROM (
        SELECT "collegeId", ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC, "collegeId" ASC) as rank
        FROM "User"
        WHERE "campaignId" = ${activeCampaignId}
        GROUP BY "collegeId"
      ) ranked
      WHERE "collegeId" = ${user.collegeId}
    `;

    if (rankRows && rankRows.length > 0) {
      campusRank = Number(rankRows[0].rank);
    }
  } catch (err) {
    // If raw query fails or tables empty, fallback to null
    campusRank = null;
  }

  return {
    referralCode: user.referralCode,
    referralUrl: buildReferralUrl(user.referralCode),
    referralCount,
    goal: 3,
    campusRank,
  };
}
