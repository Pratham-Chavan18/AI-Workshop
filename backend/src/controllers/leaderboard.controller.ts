import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import {
  getCampusLeaderboard,
  getRegistrationCount,
  getReferrerLeaderboard,
} from '../services/leaderboard.service';

async function resolveCampaignId(queryCampaignId?: string): Promise<string | null> {
  if (queryCampaignId) {
    return queryCampaignId;
  }
  const active = await prisma.campaign.findFirst({
    where: { status: 'active' },
    select: { id: true },
  });
  return active ? active.id : null;
}

export const campusLeaderboardHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const campaignId = await resolveCampaignId(req.query.campaignId as string | undefined);
    if (!campaignId) {
      res.status(200).json({ items: [], total: 0 });
      return;
    }

    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const [items, total] = await Promise.all([
      getCampusLeaderboard(campaignId, limit),
      getRegistrationCount(campaignId),
    ]);

    res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
};

export const referrerLeaderboardHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const campaignId = await resolveCampaignId(req.query.campaignId as string | undefined);
    if (!campaignId) {
      res.status(200).json({ items: [] });
      return;
    }

    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const items = await getReferrerLeaderboard(campaignId, limit);

    res.status(200).json({ items });
  } catch (error) {
    next(error);
  }
};
