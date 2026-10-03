import { describe, it, expect, beforeAll } from 'vitest';
import './helpers/mockPrisma';
import request from 'supertest';
import { app } from '../app';

const TEST_ADMIN_KEY = 'nxtwave-super-secret-admin-key-2026';

describe('Admin Authentication & Security Tests', () => {
  beforeAll(() => {
    process.env.ADMIN_API_KEY = TEST_ADMIN_KEY;
  });

  it('should reject access with HTTP 401 when X-Admin-Key is missing', async () => {
    const res = await request(app).get('/api/v1/admin/campaigns/dummy-id/stats');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should reject access with HTTP 403 when X-Admin-Key is invalid', async () => {
    const res = await request(app)
      .get('/api/v1/admin/campaigns/dummy-id/stats')
      .set('X-Admin-Key', 'definitely-wrong-key');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('should accept access when valid X-Admin-Key is supplied', async () => {
    const res = await request(app)
      .get('/api/v1/admin/campaigns/test-campaign-id/stats')
      .set('X-Admin-Key', TEST_ADMIN_KEY);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('registrations');
    expect(res.body).toHaveProperty('target');
  });

  it('should stream CSV with proper headers on export endpoint', async () => {
    const res = await request(app)
      .get('/api/v1/admin/campaigns/test-campaign-id/export?format=csv')
      .set('X-Admin-Key', TEST_ADMIN_KEY);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.headers['content-disposition']).toContain('attachment');
  });
});
