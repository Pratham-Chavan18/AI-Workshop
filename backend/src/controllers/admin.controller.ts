import { Request, Response, NextFunction } from 'express';
import {
  getCampaignStats,
  getDailyRegistrationTrend,
  getSourceBreakdown,
  getExportData,
} from '../services/admin.service';

function escapeCsvField(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export const campaignStatsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { campaignId } = req.params;
    const stats = await getCampaignStats(campaignId);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

export const dailyTrendHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { campaignId } = req.params;
    const days = Number(req.query.days) || 7;
    const trends = await getDailyRegistrationTrend(campaignId, days);
    res.status(200).json(trends);
  } catch (error) {
    next(error);
  }
};

export const sourceBreakdownHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { campaignId } = req.params;
    const sources = await getSourceBreakdown(campaignId);
    res.status(200).json(sources);
  } catch (error) {
    next(error);
  }
};

export const exportRegistrationsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { campaignId } = req.params;
    const format = typeof req.query.format === 'string' ? req.query.format.toLowerCase() : 'csv';
    const data = await getExportData(campaignId);

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="ai-workshop-registrations-${Date.now()}.json"`
      );
      res.status(200).json({ count: data.length, data });
      return;
    }

    // CSV format streaming
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="ai-workshop-registrations-${Date.now()}.csv"`
    );

    const headers = [
      'id',
      'fullName',
      'email',
      'phone',
      'collegeName',
      'collegeCity',
      'collegeState',
      'graduationYear',
      'referralCode',
      'referredByUserId',
      'referralsMadeCount',
      'source',
      'registeredAt',
    ];

    res.write(headers.join(',') + '\r\n');

    for (const item of data) {
      const row = [
        escapeCsvField(item.id),
        escapeCsvField(item.fullName),
        escapeCsvField(item.email),
        escapeCsvField(item.phone),
        escapeCsvField(item.collegeName),
        escapeCsvField(item.collegeCity),
        escapeCsvField(item.collegeState),
        escapeCsvField(item.graduationYear),
        escapeCsvField(item.referralCode),
        escapeCsvField(item.referredByUserId),
        escapeCsvField(item.referralsMadeCount),
        escapeCsvField(item.source),
        escapeCsvField(item.registeredAt),
      ];
      res.write(row.join(',') + '\r\n');
    }

    res.end();
  } catch (error) {
    next(error);
  }
};
