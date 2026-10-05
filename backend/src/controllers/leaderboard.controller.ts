import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import {
  getCampusLeaderboard,
  getRegistrationCount,
  getReferrerLeaderboard,
} from '../services/leaderboard.service';

async function resolveCampaignId(queryCampaignId?: string): Promise<string | null> {
  if (queryCampaignId) {
    const campaign = await prisma.campaign.findFirst({
      where: { id: queryCampaignId, status: 'active' },
      select: { id: true },
    });
    return campaign ? campaign.id : null;
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
    const requestedId = req.query.campaignId as string | undefined;
    const campaignId = await resolveCampaignId(requestedId);

    if (requestedId && !campaignId) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CAMPAIGN_NOT_FOUND',
          message: 'The requested campaign was not found or is not active.',
        },
      });
      return;
    }

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
    const requestedId = req.query.campaignId as string | undefined;
    const campaignId = await resolveCampaignId(requestedId);

    if (requestedId && !campaignId) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CAMPAIGN_NOT_FOUND',
          message: 'The requested campaign was not found or is not active.',
        },
      });
      return;
    }

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
