import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockPrisma } from './helpers/mockPrisma';
import request from 'supertest';
import { app } from '../app';

describe('Registration Integration Tests (Phone Normalization & Campaign Scoping)', () => {
  const collegeId = '00000000-0000-0000-0000-000000000001';

  beforeEach(() => {
    vi.clearAllMocks();

    mockPrisma.campaign.findFirst.mockResolvedValue({
      id: 'campaign-1',
      name: 'Build Your First AI Project in 60 Minutes',
      slug: 'ai60-oct-2026',
      targetRegistrations: 500,
      startsAt: new Date('2026-10-04'),
      endsAt: new Date('2026-11-04'),
      status: 'active',
    });

    mockPrisma.college.findUnique.mockResolvedValue({
      id: collegeId,
      name: 'IIT Bombay',
      city: 'Mumbai',
      state: 'Maharashtra',
    });
  });

  it('Scenario 1: Second registration attempt with the same registrant credentials returns HTTP 409', async () => {
    // 1st registration attempt succeeds
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);

    const firstRes = await request(app)
      .post('/api/v1/registrations')
      .send({
        fullName: 'Pratham Chavan',
        email: 'pratham@example.com',
        phone: '+91 98765 43210',
        collegeId,
        graduationYear: 2025,
      });

    expect(firstRes.status).toBe(201);
    expect(firstRes.body.success).toBe(true);

    // 2nd registration attempt with same email and +919876543210 hits existing user check
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'existing-user-id',
      emailNormalized: 'pratham@example.com',
      campaignId: 'campaign-1',
      phoneNormalized: '+919876543210',
    });

    const secondRes = await request(app)
      .post('/api/v1/registrations')
      .send({
        fullName: 'Pratham Chavan',
        email: 'pratham@example.com',
        phone: '+919876543210',
        collegeId,
        graduationYear: 2025,
      });

    expect(secondRes.status).toBe(409);
    expect(secondRes.body.success).toBe(false);
    expect(secondRes.body.error.code).toBe('EMAIL_ALREADY_REGISTERED');
  });

  it('Scenario 2: Distinct students with "09876543210" and "+919876543210" both succeed and normalize independently', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const res1 = await request(app)
      .post('/api/v1/registrations')
      .send({
        fullName: 'Student One',
        email: 'student1@example.com',
        phone: '09876543210',
        collegeId,
        graduationYear: 2025,
      });

    expect(res1.status).toBe(201);
    expect(res1.body.success).toBe(true);

    const res2 = await request(app)
      .post('/api/v1/registrations')
      .send({
        fullName: 'Student Two',
        email: 'student2@example.com',
        phone: '+919876543210',
        collegeId,
        graduationYear: 2025,
      });

    expect(res2.status).toBe(201);
    expect(res2.body.success).toBe(true);
  });

  it('Scenario 3: Same email registering in two different campaigns both succeed (campaign-scoped uniqueness)', async () => {
    // Campaign A registration
    mockPrisma.campaign.findFirst.mockResolvedValueOnce({
      id: 'campaign-A',
      name: 'Workshop Batch A',
      slug: 'batch-a',
      targetRegistrations: 500,
      startsAt: new Date('2026-10-04'),
      endsAt: new Date('2026-11-04'),
      status: 'active',
    });
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);

    const resCampaignA = await request(app)
      .post('/api/v1/registrations')
      .send({
        fullName: 'Pratham Chavan',
        email: 'pratham@global.com',
        collegeId,
        graduationYear: 2025,
      });

    expect(resCampaignA.status).toBe(201);
    expect(resCampaignA.body.success).toBe(true);

    // Campaign B registration with same email
    mockPrisma.campaign.findFirst.mockResolvedValueOnce({
      id: 'campaign-B',
      name: 'Workshop Batch B',
      slug: 'batch-b',
      targetRegistrations: 500,
      startsAt: new Date('2026-11-05'),
      endsAt: new Date('2026-12-05'),
      status: 'active',
    });
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);

    const resCampaignB = await request(app)
      .post('/api/v1/registrations')
      .send({
        fullName: 'Pratham Chavan',
        email: 'pratham@global.com',
        collegeId,
        graduationYear: 2025,
      });

    expect(resCampaignB.status).toBe(201);
    expect(resCampaignB.body.success).toBe(true);
  });
});
