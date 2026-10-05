import { describe, it, expect, beforeEach } from 'vitest';
import { mockPrisma, mockDb, resetMockDb } from './helpers/mockPrisma';
import request from 'supertest';
import { app } from '../app';
import { hashPassword } from '../utils/password';
import { createAdminSessionToken, ADMIN_COOKIE_NAME } from '../utils/session';
import { sanitizeCsvField } from '../controllers/admin.controller';

describe('Admin Authentication & RBAC Tests', () => {
  beforeEach(async () => {
    resetMockDb();
    // Create test admin users with different roles
    const adminPasswordHash = await hashPassword('AdminPass123!');
    const operatorPasswordHash = await hashPassword('OperatorPass123!');
    const viewerPasswordHash = await hashPassword('ViewerPass123!');

    mockDb.adminUsers = [
      {
        id: 'admin-1',
        email: 'admin@aiworkshop.test',
        passwordHash: adminPasswordHash,
        role: 'admin',
        createdAt: new Date(),
      },
      {
        id: 'operator-1',
        email: 'operator@aiworkshop.test',
        passwordHash: operatorPasswordHash,
        role: 'operator',
        createdAt: new Date(),
      },
      {
        id: 'viewer-1',
        email: 'viewer@aiworkshop.test',
        passwordHash: viewerPasswordHash,
        role: 'viewer',
        createdAt: new Date(),
      },
    ];

    mockDb.users = [
      {
        id: 'user-1',
        fullName: 'Test Student',
        email: 'student@example.com',
        emailNormalized: 'student@example.com',
        campaignId: 'test-campaign-id',
        collegeId: 'college-1',
        graduationYear: 2025,
        referralCode: 'REF001',
        createdAt: new Date(),
      },
    ];
  });

  describe('Admin Login & Session Management', () => {
    it('successfully logs in with valid credentials, sets HttpOnly cookie, and returns safe identity', async () => {
      const res = await request(app)
        .post('/api/v1/admin/auth/login')
        .send({
          email: 'admin@aiworkshop.test',
          password: 'AdminPass123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.admin).toEqual({
        id: 'admin-1',
        email: 'admin@aiworkshop.test',
        role: 'admin',
      });
      // Verify passwordHash is never returned
      expect(res.body.data.admin).not.toHaveProperty('passwordHash');

      // Verify Set-Cookie header contains HttpOnly session cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
      expect(cookieStr).toContain(ADMIN_COOKIE_NAME);
      expect(cookieStr.toLowerCase()).toContain('httponly');
    });

    it('rejects login with wrong password (401)', async () => {
      const res = await request(app)
        .post('/api/v1/admin/auth/login')
        .send({
          email: 'admin@aiworkshop.test',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects login with non-existent email (401)', async () => {
      const res = await request(app)
        .post('/api/v1/admin/auth/login')
        .send({
          email: 'nonexistent@aiworkshop.test',
          password: 'Password123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('logs out and clears the session cookie', async () => {
      const res = await request(app).post('/api/v1/admin/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
      expect(cookieStr).toContain(`${ADMIN_COOKIE_NAME}=;`);
    });
  });

  describe('Admin Authorization & Role-Based Access Control', () => {
    it('rejects unauthenticated requests to protected endpoints (401)', async () => {
      const res = await request(app).get('/api/v1/admin/stats');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('allows viewer role to access read-only analytics', async () => {
      const token = createAdminSessionToken('viewer-1', 'viewer@aiworkshop.test', 'viewer');
      const res = await request(app)
        .get('/api/v1/admin/campaigns/test-campaign-id/stats')
        .set('Cookie', `${ADMIN_COOKIE_NAME}=${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('registrations');
      expect(res.body).toHaveProperty('target');
    });

    it('forbids viewer role from exporting CSV data (403)', async () => {
      const token = createAdminSessionToken('viewer-1', 'viewer@aiworkshop.test', 'viewer');
      const res = await request(app)
        .get('/api/v1/admin/campaigns/test-campaign-id/export?format=csv')
        .set('Cookie', `${ADMIN_COOKIE_NAME}=${token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('allows operator role to export CSV data', async () => {
      const token = createAdminSessionToken('operator-1', 'operator@aiworkshop.test', 'operator');
      const res = await request(app)
        .get('/api/v1/admin/campaigns/test-campaign-id/export?format=csv')
        .set('Cookie', `${ADMIN_COOKIE_NAME}=${token}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment');
    });

    it('allows admin role to access both stats and export', async () => {
      const token = createAdminSessionToken('admin-1', 'admin@aiworkshop.test', 'admin');
      const resStats = await request(app)
        .get('/api/v1/admin/campaigns/test-campaign-id/stats')
        .set('Cookie', `${ADMIN_COOKIE_NAME}=${token}`);
      expect(resStats.status).toBe(200);

      const resExport = await request(app)
        .get('/api/v1/admin/campaigns/test-campaign-id/export?format=csv')
        .set('Cookie', `${ADMIN_COOKIE_NAME}=${token}`);
      expect(resExport.status).toBe(200);
    });
  });

  describe('CSV Injection Sanitization', () => {
    it('sanitizes formula triggers (=, +, -, @) with prepended single quote', () => {
      expect(sanitizeCsvField('=1+1')).toBe("'=1+1");
      expect(sanitizeCsvField('+cmd|')).toBe("'+cmd|");
      expect(sanitizeCsvField('-10')).toBe("'-10");
      expect(sanitizeCsvField('@SUM(A1:A10)')).toBe("'@SUM(A1:A10)");
      expect(sanitizeCsvField('Normal Name')).toBe('Normal Name');
      expect(sanitizeCsvField(null)).toBe('');
    });
  });
});
