import { describe, it, expect } from 'vitest';
import './helpers/mockPrisma';
import request from 'supertest';
import { app } from '../app';

describe('Public Leaderboard Privacy & Structure Tests', () => {
  it('GET /api/v1/leaderboard/campuses should not expose student emails or phones', async () => {
    const res = await request(app).get('/api/v1/leaderboard/campuses');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');

    const items = res.body.items || [];
    for (const item of items) {
      expect(item).not.toHaveProperty('email');
      expect(item).not.toHaveProperty('phone');
    }
  });

  it('GET /api/v1/leaderboard/referrers should not expose student emails or phones', async () => {
    const res = await request(app).get('/api/v1/leaderboard/referrers');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');

    const items = res.body.items || [];
    for (const item of items) {
      expect(item).not.toHaveProperty('email');
      expect(item).not.toHaveProperty('phone');
    }
  });
});
