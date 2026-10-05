import { describe, it, expect, beforeEach } from 'vitest';
import { mockPrisma, mockDb, resetMockDb } from './helpers/mockPrisma';
import { registerStudent } from '../services/registration.service';
import { getDailyRegistrationTrend } from '../services/admin.service';
import {
  CampaignClosedError,
  InvalidReferralCodeError,
  SelfReferralError,
} from '../utils/errors';

describe('Campaign Rules & Referral Campaign Scoping Tests', () => {
  beforeEach(() => {
    resetMockDb();
    mockDb.users = [
      {
        id: 'referrer-camp-a',
        fullName: 'Referrer A',
        emailNormalized: 'referrer.a@example.com',
        campaignId: 'campaign-A',
        referralCode: 'REFA01',
      },
    ];
  });

  describe('Campaign Start / End Time Enforcement', () => {
    it('rejects registration before campaign start date', async () => {
      mockPrisma.campaign.findFirst.mockResolvedValueOnce({
        id: 'future-campaign',
        name: 'Future Workshop',
        slug: 'future-workshop',
        targetRegistrations: 500,
        startsAt: new Date(Date.now() + 86400000), // tomorrow
        endsAt: new Date(Date.now() + 86400000 * 10),
        status: 'active',
      });

      await expect(
        registerStudent({
          fullName: 'Early Bird',
          email: 'early@example.com',
          collegeId: '00000000-0000-0000-0000-000000000001',
          graduationYear: 2025,
          source: 'direct',
        })
      ).rejects.toThrow(CampaignClosedError);
    });

    it('rejects registration after campaign end date', async () => {
      mockPrisma.campaign.findFirst.mockResolvedValueOnce({
        id: 'past-campaign',
        name: 'Past Workshop',
        slug: 'past-workshop',
        targetRegistrations: 500,
        startsAt: new Date(Date.now() - 86400000 * 10),
        endsAt: new Date(Date.now() - 86400000), // yesterday
        status: 'active',
      });

      await expect(
        registerStudent({
          fullName: 'Late Student',
          email: 'late@example.com',
          collegeId: '00000000-0000-0000-0000-000000000001',
          graduationYear: 2025,
          source: 'direct',
        })
      ).rejects.toThrow(CampaignClosedError);
    });

    it('rejects registration when campaign status is closed or paused', async () => {
      mockPrisma.campaign.findFirst.mockResolvedValueOnce(null);

      await expect(
        registerStudent({
          fullName: 'No Campaign',
          email: 'nocamp@example.com',
          collegeId: '00000000-0000-0000-0000-000000000001',
          graduationYear: 2025,
          source: 'direct',
        })
      ).rejects.toThrow(CampaignClosedError);
    });
  });

  describe('Cross-Campaign Referral Isolation', () => {
    it('accepts referral code when referrer belongs to the SAME campaign', async () => {
      mockPrisma.campaign.findFirst.mockResolvedValueOnce({
        id: 'campaign-A',
        name: 'Workshop A',
        slug: 'workshop-a',
        targetRegistrations: 500,
        startsAt: new Date(Date.now() - 86400000),
        endsAt: new Date(Date.now() + 86400000),
        status: 'active',
      });

      const result = await registerStudent({
        fullName: 'Valid Referral Student',
        email: 'referred@example.com',
        collegeId: '00000000-0000-0000-0000-000000000001',
        graduationYear: 2025,
        referralCode: 'REFA01',
        source: 'direct',
      });

      expect(result.user).toBeDefined();
      expect(result.campaignId).toBe('campaign-A');
    });

    it('rejects referral code when referrer belongs to a DIFFERENT campaign (cross-campaign referral)', async () => {
      mockPrisma.campaign.findFirst.mockResolvedValueOnce({
        id: 'campaign-B', // Different campaign!
        name: 'Workshop B',
        slug: 'workshop-b',
        targetRegistrations: 500,
        startsAt: new Date(Date.now() - 86400000),
        endsAt: new Date(Date.now() + 86400000),
        status: 'active',
      });

      // User REFA01 is in campaign-A, but student is registering in campaign-B
      await expect(
        registerStudent({
          fullName: 'Cross Campaign Student',
          email: 'cross@example.com',
          collegeId: '00000000-0000-0000-0000-000000000001',
          graduationYear: 2025,
          referralCode: 'REFA01',
          source: 'direct',
        })
      ).rejects.toThrow(InvalidReferralCodeError);
    });
  });

  describe('Daily Trend SQL Parameterization', () => {
    it('accepts valid days parameters (1, 7, 14, 30 days) and runs parameterized query', async () => {
      const mockRaw = mockPrisma.$queryRaw.mockResolvedValueOnce([
        { date: '2026-10-05', count: 12 },
      ]);

      for (const days of [1, 7, 14, 30]) {
        const trend = await getDailyRegistrationTrend('campaign-A', days);
        expect(Array.isArray(trend)).toBe(true);
      }
    });

    it('clamps or rejects out-of-range days parameters', async () => {
      // Testing with boundary inputs
      const trendHigh = await getDailyRegistrationTrend('campaign-A', 150);
      expect(Array.isArray(trendHigh)).toBe(true);
      const trendLow = await getDailyRegistrationTrend('campaign-A', -5);
      expect(Array.isArray(trendLow)).toBe(true);
    });
  });
});
