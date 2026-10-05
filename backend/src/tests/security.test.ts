import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import './helpers/mockPrisma';
import request from 'supertest';
import { app } from '../app';
import { mockPrisma, mockDb, resetMockDb } from './helpers/mockPrisma';
import { attributeReferral } from '../services/referral.service';
import { registerStudent } from '../services/registration.service';
import { createStudentSessionToken, STUDENT_COOKIE_NAME } from '../utils/session';

const TEST_ADMIN_KEY = 'nxtwave-super-secret-admin-key-2026';

describe('Security Hardening & Negative Authorization Tests', () => {
  beforeAll(() => {
    process.env.ADMIN_API_KEY = TEST_ADMIN_KEY;
  });

  describe('1. Admin Authorization Gatekeeper', () => {
    it('Negative: Unauthenticated request to admin endpoints returns HTTP 401', async () => {
      const res = await request(app).get('/api/v1/admin/campaigns/dummy-id/stats');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('Negative: Non-admin or invalid admin key returns HTTP 401', async () => {
      const res = await request(app)
        .get('/api/v1/admin/campaigns/dummy-id/stats')
        .set('X-Admin-Key', 'attacker-key');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('Negative: Client-provided role injection does not bypass admin gatekeeper', async () => {
      const res = await request(app)
        .get('/api/v1/admin/campaigns/dummy-id/stats')
        .send({ role: 'admin', isAdmin: true });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Registration Security & PII Protection', () => {
    beforeEach(() => {
      resetMockDb();
    });

    it('Negative: Malformed email or invalid input is rejected with HTTP 400', async () => {
      const res = await request(app)
        .post('/api/v1/registrations')
        .send({
          fullName: 'A',
          email: 'not-an-email',
          collegeId: 'invalid-uuid',
          graduationYear: 2035,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('Negative: Duplicate registration attempt is blocked with HTTP 409', async () => {
      // Mock existing user in database
      mockDb.users.push({
        id: 'existing-user-id',
        campaignId: 'test-campaign-id',
        emailNormalized: 'duplicate@student.edu',
        referralCode: 'DUP123',
      });

      await expect(
        registerStudent({
          fullName: 'Duplicate Student',
          email: 'duplicate@student.edu',
          collegeId: '00000000-0000-0000-0000-000000000001',
          graduationYear: 2025,
          source: 'direct',
        })
      ).rejects.toThrow('This email is already registered for the workshop');
    });

    it('Registration output never exposes sensitive PII (phone number, hashed keys, internal tokens)', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null); // No duplicate
      const result = await registerStudent({
        fullName: 'Private Student',
        email: 'private@student.edu',
        phone: '+919876543210',
        collegeId: '00000000-0000-0000-0000-000000000001',
        graduationYear: 2025,
        source: 'direct',
      });

      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('fullName');
      expect(result.user).toHaveProperty('referralCode');
      expect(result.user).toHaveProperty('referralUrl');
      // Verify sensitive fields are NOT in the public response
      expect(result.user).not.toHaveProperty('phone');
      expect(result.user).not.toHaveProperty('phoneNormalized');
      expect(result.user).not.toHaveProperty('email');
    });
  });

  describe('3. Referral Security & Fraud Prevention', () => {
    it('Negative: Student cannot refer themselves via email match', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({
        id: 'user-self',
        campaignId: 'test-campaign-id',
        referralCode: 'SELF01',
        emailNormalized: 'self@student.edu',
      });

      await expect(
        registerStudent({
          fullName: 'Self Referrer',
          email: 'self@student.edu',
          collegeId: '00000000-0000-0000-0000-000000000001',
          graduationYear: 2025,
          referralCode: 'SELF01',
          source: 'direct',
        })
      ).rejects.toThrow('You cannot refer yourself');
    });

    it('Negative: Self-referral attribution logic rejects attribution', async () => {
      const result = await attributeReferral({
        campaignId: 'camp-1',
        referrerId: 'user-same-id',
        referredUserId: 'user-same-id',
        referralCode: 'SELF01',
      });

      expect(result.credited).toBe(false);
      expect(result.reason).toBe('self_referral');
    });

    it('Negative: Double attribution prevention (same referred user cannot be attributed twice)', async () => {
      mockPrisma.referral.findUnique.mockResolvedValueOnce({
        id: 'existing-referral-id',
        referredUserId: 'already-referred-user',
      });

      const result = await attributeReferral({
        campaignId: 'camp-1',
        referrerId: 'user-a',
        referredUserId: 'already-referred-user',
        referralCode: 'CODEA',
      });

      expect(result.credited).toBe(false);
      expect(result.reason).toBe('already_attributed');
    });
  });

  describe('4. Public Leaderboard Data Filtering & Query Isolation', () => {
    it('Campus leaderboard exposes ONLY safe aggregate numbers, never student PII', async () => {
      const res = await request(app).get('/api/v1/leaderboard/campuses');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('items');
      const item = res.body.items[0];
      if (item) {
        expect(item).toHaveProperty('rank');
        expect(item).toHaveProperty('collegeName');
        expect(item).toHaveProperty('registrations');
        // Critical: PII must NEVER be in leaderboard
        expect(item).not.toHaveProperty('email');
        expect(item).not.toHaveProperty('phone');
        expect(item).not.toHaveProperty('passwordHash');
        expect(item).not.toHaveProperty('studentId');
      }
    });

    it('Referrer leaderboard exposes ONLY safe display names and counts, never contact info', async () => {
      const res = await request(app).get('/api/v1/leaderboard/referrers');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('items');
      const item = res.body.items[0];
      if (item) {
        expect(item).toHaveProperty('displayName');
        expect(item).toHaveProperty('collegeName');
        expect(item).toHaveProperty('referralCount');
        // Critical: contact info must NEVER be exposed
        expect(item).not.toHaveProperty('email');
        expect(item).not.toHaveProperty('phone');
        expect(item).not.toHaveProperty('userId');
        expect(item).not.toHaveProperty('referralCode');
      }
    });

    it('Negative: Arbitrary write / modification to leaderboard is rejected (POST/PUT not allowed)', async () => {
      const res = await request(app)
        .post('/api/v1/leaderboard/campuses')
        .send({ registrations: 99999 });

      expect([404, 405]).toContain(res.status);
    });
  });

  describe('5. Input Validation & Parameter Sanitization', () => {
    it('Negative: Unauthenticated request to /users/:userId/referrals is rejected with HTTP 401', async () => {
      const res = await request(app).get('/api/v1/users/not-a-valid-uuid/referrals');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('Negative: Authenticated request with invalid UUID in /users/:userId/referrals is rejected with HTTP 400', async () => {
      const token = createStudentSessionToken('user-1', 'camp-1');
      const res = await request(app)
        .get('/api/v1/users/not-a-valid-uuid/referrals')
        .set('Cookie', `${STUDENT_COOKIE_NAME}=${token}`);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('Negative: Invalid UUID in /campaigns/:campaignId/stats is rejected with HTTP 400', async () => {
      const res = await request(app).get('/api/v1/campaigns/malformed-id/stats');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
