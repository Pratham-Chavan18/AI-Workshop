import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { notFound } from '../utils/errors';

const router = Router();

// GET /api/v1/campaigns/active - get current active campaign info
router.get('/active', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await prisma.campaign.findFirst({
      where: { status: 'active' },
      select: {
        id: true,
        name: true,
        slug: true,
        targetRegistrations: true,
        startsAt: true,
        endsAt: true,
        status: true,
      },
    });

    if (!campaign) {
      throw notFound('No active campaign found');
    }

    res.status(200).json({ campaign });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/campaigns/:campaignId/stats
router.get('/:campaignId/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { campaignId } = req.params;
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        _count: {
          select: {
            users: true,
            referrals: { where: { status: 'valid' } },
          },
        },
      },
    });

    if (!campaign) {
      throw notFound('Campaign not found');
    }

    res.status(200).json({
      stats: {
        campaignId: campaign.id,
        name: campaign.name,
        targetRegistrations: campaign.targetRegistrations,
        totalRegistrations: campaign._count.users,
        totalReferrals: campaign._count.referrals,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
