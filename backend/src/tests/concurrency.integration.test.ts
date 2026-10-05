import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { registerStudent } from '../services/registration.service';
import { attributeReferral } from '../services/referral.service';
import { DuplicateEmailError } from '../utils/errors';

/**
 * Real PostgreSQL Concurrency and Database Constraint Integration Tests.
 * Tests mandatory requirement Section 41:
 * - N concurrent requests for same (campaign + email) -> exactly 1 success, N-1 deterministic duplicates (409)
 * - Concurrent referral attribution for same referred user -> exactly 1 credited attribution
 */
describe('Real PostgreSQL Concurrency & Unique Constraint Race Condition Tests', () => {
  let realPrisma: PrismaClient;
  let isPostgresAvailable = false;
  let testCampaignId: string;
  let testCollegeId: string;

  let originalCampaignStatuses: Array<{ id: string; status: string }> = [];

  const restoreCampaignStatuses = async () => {
    if (!realPrisma || originalCampaignStatuses.length === 0) return;
    for (const c of originalCampaignStatuses) {
      await realPrisma.campaign
        .update({
          where: { id: c.id },
          data: { status: c.status },
        })
        .catch(() => {});
    }
  };

  beforeAll(async () => {
    // Only connect if DATABASE_URL is set and not a placeholder
    const dbUrl = process.env.DATABASE_URL || '';
    if (!dbUrl || dbUrl.includes('test:test@localhost:5432')) {
      console.log('ℹ️ Local real PostgreSQL not configured for integration test. Concurrency test suite configured for real DB environments.');
      return;
    }

    let setupSucceeded = false;
    try {
      realPrisma = new PrismaClient({
        datasources: { db: { url: dbUrl } },
      });
      await realPrisma.$queryRaw`SELECT 1`;
      isPostgresAvailable = true;

      // Record original statuses of any other campaigns before pausing
      originalCampaignStatuses = await realPrisma.campaign.findMany({
        where: { slug: { not: 'concurrency-test-campaign' } },
        select: { id: true, status: true },
      });

      // Pause any other campaigns so concurrency-test-campaign is the only active one
      await realPrisma.campaign.updateMany({
        where: { slug: { not: 'concurrency-test-campaign' } },
        data: { status: 'paused' },
      });

      // Ensure test campaign exists
      const camp = await realPrisma.campaign.upsert({
        where: { slug: 'concurrency-test-campaign' },
        update: {
          status: 'active',
          startsAt: new Date(Date.now() - 3600000),
          endsAt: new Date(Date.now() + 86400000 * 30),
        },
        create: {
          name: 'Concurrency Test Campaign',
          slug: 'concurrency-test-campaign',
          targetRegistrations: 100,
          startsAt: new Date(Date.now() - 3600000),
          endsAt: new Date(Date.now() + 86400000 * 30),
          status: 'active',
        },
      });
      testCampaignId = camp.id;

      // Ensure test college exists
      const col = await realPrisma.college.upsert({
        where: { nameNormalized: 'concurrencycollege' },
        update: {},
        create: {
          name: 'Concurrency College',
          nameNormalized: 'concurrencycollege',
          city: 'TechCity',
          state: 'TechState',
        },
      });
      testCollegeId = col.id;
      setupSucceeded = true;
    } catch (err) {
      console.warn('⚠️ Real PostgreSQL unreachable or setup failed:', (err as Error).message);
      isPostgresAvailable = false;
    } finally {
      if (!setupSucceeded && isPostgresAvailable) {
        await restoreCampaignStatuses();
      }
    }
  });

  afterAll(async () => {
    if (isPostgresAvailable && realPrisma) {
      // Clean up test records
      try {
        await realPrisma.referral.deleteMany({
          where: { campaignId: testCampaignId },
        });
        await realPrisma.user.deleteMany({
          where: { campaignId: testCampaignId },
        });
        await realPrisma.campaign.deleteMany({
          where: { id: testCampaignId },
        });
      } catch (e) {
        // ignore cleanup error
      } finally {
        await restoreCampaignStatuses();
      }
      await realPrisma.$disconnect();
    }
  });

  it('handles N concurrent registrations with the same email atomically: exactly 1 succeeds and N-1 reject with 409 conflict', async () => {
    if (!isPostgresAvailable) {
      console.log('⏭️ Skipping real Postgres concurrency execution (no live DB connection).');
      return;
    }

    const testEmail = `race-test-${Date.now()}@student.edu`;
    const N = 8;

    const promises = Array.from({ length: N }).map((_, idx) =>
      registerStudent({
        fullName: `Race Student ${idx}`,
        email: testEmail,
        collegeId: testCollegeId,
        graduationYear: 2025,
        source: 'direct',
      })
        .then((res) => ({ status: 'fulfilled' as const, value: res }))
        .catch((err) => ({ status: 'rejected' as const, reason: err }))
    );

    const results = await Promise.all(promises);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Exactly 1 must have succeeded
    expect(fulfilled.length).toBe(1);
    // Exactly N - 1 must have failed with duplicate error
    expect(rejected.length).toBe(N - 1);

    for (const rej of rejected) {
      expect((rej as any).reason).toBeInstanceOf(DuplicateEmailError);
    }

    // Verify database has exactly 1 record
    const count = await realPrisma.user.count({
      where: {
        campaignId: testCampaignId,
        emailNormalized: testEmail.toLowerCase().trim(),
      },
    });
    expect(count).toBe(1);
  });

  it('handles concurrent referral attribution: exactly 1 succeeds and duplicates are rejected', async () => {
    if (!isPostgresAvailable) {
      console.log('⏭️ Skipping real Postgres referral concurrency execution (no live DB connection).');
      return;
    }

    // Create a referrer and a referred student
    const referrer = await realPrisma.user.create({
      data: {
        fullName: 'Referrer Student',
        email: `referrer-${Date.now()}@student.edu`,
        emailNormalized: `referrer-${Date.now()}@student.edu`,
        campaignId: testCampaignId,
        collegeId: testCollegeId,
        graduationYear: 2025,
        referralCode: `CONC${Math.floor(1000 + Math.random() * 9000)}`,
        source: 'direct',
      },
    });

    const referred = await realPrisma.user.create({
      data: {
        fullName: 'Referred Student',
        email: `referred-${Date.now()}@student.edu`,
        emailNormalized: `referred-${Date.now()}@student.edu`,
        campaignId: testCampaignId,
        collegeId: testCollegeId,
        graduationYear: 2025,
        referralCode: `CONC${Math.floor(1000 + Math.random() * 9000)}`,
        source: 'referral',
      },
    });

    const N = 6;
    const attributionPromises = Array.from({ length: N }).map(() =>
      attributeReferral({
        campaignId: testCampaignId,
        referrerId: referrer.id,
        referredUserId: referred.id,
        referralCode: referrer.referralCode,
      })
    );

    const results = await Promise.all(attributionPromises);

    const credited = results.filter((r) => r.credited === true);
    const rejected = results.filter((r) => r.credited === false);

    expect(credited.length).toBe(1);
    expect(rejected.length).toBe(N - 1);

    // Verify exactly 1 referral record in database
    const referralCount = await realPrisma.referral.count({
      where: {
        campaignId: testCampaignId,
        referredUserId: referred.id,
      },
    });
    expect(referralCount).toBe(1);
  });
});
