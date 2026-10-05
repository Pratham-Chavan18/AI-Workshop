import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockPrisma, mockDb, resetMockDb } from './helpers/mockPrisma';
import request from 'supertest';
import { app } from '../app';

describe('Registration Integration Tests (Phone Normalization & Campaign Scoping)', () => {
  const collegeId = '00000000-0000-0000-0000-000000000001';

  beforeEach(() => {
    vi.clearAllMocks();
    resetMockDb();

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

  // BLOCKER 1: Prove phone uniqueness collides across formats
  it('collides when the same phone is submitted in two formats', async () => {
    await request(app).post('/api/registrations').send({
      name: 'A', email: 'a@x.com', campus: 'X', phone: '+919876543210',
    }).expect(201);

    const res = await request(app).post('/api/registrations').send({
      name: 'B', email: 'b@x.com', campus: 'X', phone: '+91 98765 43210',
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('PHONE_ALREADY_REGISTERED');
  });

  it('collides when + is misplaced in the second submission', async () => {
    await request(app).post('/api/registrations').send({
      name: 'C', email: 'c@x.com', campus: 'X', phone: '+919876543210',
    }).expect(201);

    const res = await request(app).post('/api/registrations').send({
      name: 'D', email: 'd@x.com', campus: 'X', phone: '91+9876543210',
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('PHONE_ALREADY_REGISTERED');
  });

  // BUG A: Race condition on unique constraints via Promise.all
  it('handles race condition on concurrent registrations with same email via Promise.all', async () => {
    const payload1 = {
      fullName: 'Concurrent User One',
      email: 'concurrent@example.com',
      collegeId,
      graduationYear: 2025,
    };
    const payload2 = {
      fullName: 'Concurrent User Two',
      email: 'concurrent@example.com',
      collegeId,
      graduationYear: 2025,
    };

    const [res1, res2] = await Promise.all([
      request(app).post('/api/registrations').send(payload1),
      request(app).post('/api/registrations').send(payload2),
    ]);

    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([201, 409]);

    const errorRes = res1.status === 409 ? res1 : res2;
    expect(errorRes.body.error.code).toBe('EMAIL_ALREADY_REGISTERED');
  });

  // BUG B: Referral credit must be atomic with registration (transaction rollback on failure)
  it('atomically rolls back registration when referral credit step fails', async () => {
    const referrerRes = await request(app).post('/api/registrations').send({
      fullName: 'Referrer Host',
      email: 'referrer.host@example.com',
      collegeId,
      graduationYear: 2025,
    });
    expect(referrerRes.status).toBe(201);
    const refCode = referrerRes.body.user.referralCode;

    // Force referral creation to fail inside the transaction
    mockPrisma.referral.create.mockRejectedValueOnce(new Error('Simulated DB failure on credit'));

    const res = await request(app).post('/api/registrations').send({
      fullName: 'Candidate Registrant',
      email: 'candidate@example.com',
      collegeId,
      graduationYear: 2025,
      referralCode: refCode,
    });

    expect(res.status).toBe(500);

    // Verify candidate is NOT persisted in DB due to atomic rollback
    const candidateInDb = mockDb.users.find((u) => u.emailNormalized === 'candidate@example.com');
    expect(candidateInDb).toBeUndefined();
  });

  // BUG C: Prevent self-referral by email and by phone
  it('prevents self-referral when registrant has the same email as referrer', async () => {
    const orig = await request(app).post('/api/registrations').send({
      fullName: 'Self Referrer Email',
      email: 'sameperson@example.com',
      collegeId,
      graduationYear: 2025,
    });
    expect(orig.status).toBe(201);
    const refCode = orig.body.user.referralCode;

    const selfAttempt = await request(app).post('/api/registrations').send({
      fullName: 'Self Referrer Attempt',
      email: 'sameperson@example.com',
      collegeId,
      graduationYear: 2025,
      referralCode: refCode,
    });
    expect(selfAttempt.status).toBe(400);
    expect(selfAttempt.body.error.code).toBe('SELF_REFERRAL');
  });

  it('prevents self-referral when registrant has the same phone as referrer', async () => {
    const orig = await request(app).post('/api/registrations').send({
      fullName: 'Phone Host',
      email: 'host@example.com',
      phone: '+919988776655',
      collegeId,
      graduationYear: 2025,
    });
    expect(orig.status).toBe(201);
    const refCode = orig.body.user.referralCode;

    const selfAttempt = await request(app).post('/api/registrations').send({
      fullName: 'Different Email Same Phone',
      email: 'otheremail@example.com',
      phone: '+91 99887 76655', // same phone across formatting
      collegeId,
      graduationYear: 2025,
      referralCode: refCode,
    });
    expect(selfAttempt.status).toBe(400);
    expect(selfAttempt.body.error.code).toBe('SELF_REFERRAL');
  });

  // BUG F: Normalize referral code at lookup site
  it('normalizes lowercase referral code and credits referrer correctly', async () => {
    const host = await request(app).post('/api/registrations').send({
      fullName: 'Alpha Referrer',
      email: 'alpha@example.com',
      collegeId,
      graduationYear: 2025,
    });
    expect(host.status).toBe(201);
    const refCode = host.body.user.referralCode;

    const res = await request(app).post('/api/registrations').send({
      fullName: 'Beta Student',
      email: 'beta@example.com',
      collegeId,
      graduationYear: 2025,
      referralCode: refCode.toLowerCase(), // lowercase code
    });

    expect(res.status).toBe(201);
    const referralRecord = mockDb.referrals.find((r) => r.referralCode === refCode);
    expect(referralRecord).toBeDefined();
    expect(referralRecord?.referrerUserId).toBe(host.body.user.id);
  });

  // CONCERN K: Reject registrations for closed campaigns
  it('rejects registrations for closed campaigns with HTTP 410', async () => {
    mockPrisma.campaign.findFirst.mockResolvedValueOnce({
      id: 'campaign-ended',
      name: 'Past Workshop',
      slug: 'past-workshop',
      targetRegistrations: 500,
      startsAt: new Date('2024-01-01'),
      endsAt: new Date('2024-02-01'), // past date
      status: 'active',
    });

    const res = await request(app).post('/api/registrations').send({
      fullName: 'Late Registrant',
      email: 'late@example.com',
      collegeId,
      graduationYear: 2025,
    });

    expect(res.status).toBe(410);
    expect(res.body.error.code).toBe('CAMPAIGN_CLOSED');
  });

  // Existing test scenarios
  it('Scenario 1: Second registration attempt with the same registrant credentials returns HTTP 409', async () => {
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
    mockPrisma.campaign.findFirst.mockResolvedValueOnce({
      id: 'campaign-A',
      name: 'Workshop Batch A',
      slug: 'batch-a',
      targetRegistrations: 500,
      startsAt: new Date('2026-10-04'),
      endsAt: new Date('2026-11-04'),
      status: 'active',
    });

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

    mockPrisma.campaign.findFirst.mockResolvedValueOnce({
      id: 'campaign-B',
      name: 'Workshop Batch B',
      slug: 'batch-b',
      targetRegistrations: 500,
      startsAt: new Date('2026-10-01'),
      endsAt: new Date('2026-11-01'),
      status: 'active',
    });

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
