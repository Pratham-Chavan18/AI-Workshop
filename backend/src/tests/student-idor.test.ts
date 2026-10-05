import { describe, it, expect, beforeEach } from 'vitest';
import { mockPrisma, mockDb, resetMockDb } from './helpers/mockPrisma';
import request from 'supertest';
import { app } from '../app';
import { createStudentSessionToken, STUDENT_COOKIE_NAME } from '../utils/session';

describe('Student Dashboard IDOR & Session Security Tests', () => {
  beforeEach(() => {
    resetMockDb();

    const idA = '00000000-0000-0000-0000-00000000000a';
    const idB = '00000000-0000-0000-0000-00000000000b';

    mockDb.users = [
      {
        id: idA,
        fullName: 'Student Alpha',
        email: 'alpha@college.edu',
        emailNormalized: 'alpha@college.edu',
        campaignId: 'camp-1',
        collegeId: 'college-1',
        graduationYear: 2025,
        referralCode: 'ALPHA1',
        createdAt: new Date(),
      },
      {
        id: idB,
        fullName: 'Student Beta',
        email: 'beta@college.edu',
        emailNormalized: 'beta@college.edu',
        campaignId: 'camp-1',
        collegeId: 'college-2',
        graduationYear: 2025,
        referralCode: 'BETA02',
        createdAt: new Date(),
      },
    ];
  });

  it('1. Student A accesses own dashboard via session cookie -> 200', async () => {
    const idA = '00000000-0000-0000-0000-00000000000a';
    const tokenA = createStudentSessionToken(idA, 'camp-1');
    const res = await request(app)
      .get('/api/v1/users/me/dashboard')
      .set('Cookie', `${STUDENT_COOKIE_NAME}=${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.student.id).toBe(idA);
    expect(res.body.student.fullName).toBe('Student Alpha');
  });

  it('2. Student A attempts to access Student B referrals via /users/:userId/referrals -> 403', async () => {
    const idA = '00000000-0000-0000-0000-00000000000a';
    const idB = '00000000-0000-0000-0000-00000000000b';
    const tokenA = createStudentSessionToken(idA, 'camp-1');
    const res = await request(app)
      .get(`/api/v1/users/${idB}/referrals`)
      .set('Cookie', `${STUDENT_COOKIE_NAME}=${tokenA}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('3. Unauthenticated dashboard request -> 401', async () => {
    const res = await request(app).get('/api/v1/users/me/dashboard');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('4. Invalid session token -> 401', async () => {
    const res = await request(app)
      .get('/api/v1/users/me/dashboard')
      .set('Cookie', `${STUDENT_COOKIE_NAME}=tampered-invalid-token`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('5. Deleted/non-existent user session -> 401', async () => {
    const tokenGhost = createStudentSessionToken('user-ghost-deleted', 'camp-1');
    const res = await request(app)
      .get('/api/v1/users/me/dashboard')
      .set('Cookie', `${STUDENT_COOKIE_NAME}=${tokenGhost}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('6. Direct modification of query or body parameters cannot bypass session authorization', async () => {
    const idA = '00000000-0000-0000-0000-00000000000a';
    const idB = '00000000-0000-0000-0000-00000000000b';
    const tokenA = createStudentSessionToken(idA, 'camp-1');
    const res = await request(app)
      .get(`/api/v1/users/me/dashboard?userId=${idB}&impersonate=true`)
      .set('Cookie', `${STUDENT_COOKIE_NAME}=${tokenA}`);

    expect(res.status).toBe(200);
    // Returns user-a, never user-b regardless of query parameters
    expect(res.body.student.id).toBe(idA);
    expect(res.body.student.fullName).toBe('Student Alpha');
  });

  it('7. Student can logout and session cookie is cleared', async () => {
    const res = await request(app).post('/api/v1/users/logout');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
    expect(cookieStr).toContain(`${STUDENT_COOKIE_NAME}=;`);
  });
});
