import { vi } from 'vitest';

export const mockDb = {
  users: [] as any[],
  referrals: [] as any[],
  adminUsers: [] as any[],
};

export function resetMockDb() {
  mockDb.users = [];
  mockDb.referrals = [];
  mockDb.adminUsers = [];
}

export const mockPrisma = {
  campaign: {
    findFirst: vi.fn().mockResolvedValue({
      id: 'test-campaign-id',
      name: 'Build Your First AI Project in 60 Minutes',
      slug: 'ai60-oct-2026',
      targetRegistrations: 500,
      startsAt: new Date(Date.now() - 86400000),
      endsAt: new Date(Date.now() + 86400000 * 30),
      status: 'active',
    }),
    findUnique: vi.fn().mockResolvedValue({
      id: 'test-campaign-id',
      name: 'Build Your First AI Project in 60 Minutes',
      slug: 'ai60-oct-2026',
      targetRegistrations: 500,
      startsAt: new Date(Date.now() - 86400000),
      endsAt: new Date(Date.now() + 86400000 * 30),
      status: 'active',
      _count: { users: 12, referrals: 4 },
    }),
    upsert: vi.fn(),
  },
  college: {
    findMany: vi.fn().mockResolvedValue([
      { id: 'college-1', name: 'IIT Bombay', city: 'Mumbai', state: 'Maharashtra' },
      { id: 'college-2', name: 'BITS Pilani', city: 'Pilani', state: 'Rajasthan' },
    ]),
    findUnique: vi.fn().mockImplementation(({ where }) =>
      Promise.resolve({
        id: where?.id || '00000000-0000-0000-0000-000000000001',
        name: 'IIT Bombay',
        city: 'Mumbai',
        state: 'Maharashtra',
      })
    ),
    upsert: vi.fn(),
  },
  user: {
    findFirst: vi.fn().mockImplementation(({ where }) => {
      if (where?.campaignId && where?.referralCode) {
        const found = mockDb.users.find(
          (u) => u.campaignId === where.campaignId && u.referralCode === where.referralCode
        );
        return Promise.resolve(found || null);
      }
      if (where?.referralCode) {
        const found = mockDb.users.find((u) => u.referralCode === where.referralCode);
        return Promise.resolve(found || null);
      }
      if (where?.campaignId && where?.phoneNormalized) {
        const found = mockDb.users.find(
          (u) => u.campaignId === where.campaignId && u.phoneNormalized === where.phoneNormalized
        );
        return Promise.resolve(found || null);
      }
      return Promise.resolve(mockDb.users[0] || null);
    }),
    findUnique: vi.fn().mockImplementation(({ where }) => {
      if (where?.referralCode) {
        const found = mockDb.users.find((u) => u.referralCode === where.referralCode);
        return Promise.resolve(found || null);
      }
      if (where?.id) {
        const found = mockDb.users.find((u) => u.id === where.id);
        return Promise.resolve(found || null);
      }
      if (where?.campaignId_emailNormalized) {
        const found = mockDb.users.find(
          (u) =>
            u.campaignId === where.campaignId_emailNormalized.campaignId &&
            u.emailNormalized === where.campaignId_emailNormalized.emailNormalized
        );
        return Promise.resolve(found || null);
      }
      return Promise.resolve(null);
    }),
    findMany: vi.fn().mockImplementation(({ where, skip, take }) => {
      let filtered = [...mockDb.users];
      if (where?.campaignId) {
        filtered = filtered.filter((u) => u.campaignId === where.campaignId);
      }
      if (typeof skip === 'number' && typeof take === 'number') {
        return Promise.resolve(
          filtered.slice(skip, skip + take).map((u) => ({
            ...u,
            college: { name: 'IIT Bombay' },
          }))
        );
      }
      return Promise.resolve(
        filtered.map((u) => ({
          ...u,
          college: { name: 'IIT Bombay' },
        }))
      );
    }),
    create: vi.fn().mockImplementation(({ data }) => {
      // Check unique constraint: (campaignId, emailNormalized)
      const existingEmail = mockDb.users.find(
        (u) => u.campaignId === data.campaignId && u.emailNormalized === data.emailNormalized
      );
      if (existingEmail) {
        const err: any = new Error('Unique constraint failed on the fields: (`campaignId`, `emailNormalized`)');
        err.code = 'P2002';
        err.meta = { target: ['campaignId', 'emailNormalized'] };
        return Promise.reject(err);
      }

      // Check unique constraint: (campaignId, phoneNormalized)
      if (data.phoneNormalized) {
        const existingPhone = mockDb.users.find(
          (u) => u.campaignId === data.campaignId && u.phoneNormalized === data.phoneNormalized
        );
        if (existingPhone) {
          const err: any = new Error('Unique constraint failed on the fields: (`campaignId`, `phoneNormalized`)');
          err.code = 'P2002';
          err.meta = { target: ['campaignId', 'phoneNormalized'] };
          return Promise.reject(err);
        }
      }

      // Check unique constraint: referralCode
      if (data.referralCode) {
        const existingCode = mockDb.users.find((u) => u.referralCode === data.referralCode);
        if (existingCode) {
          const err: any = new Error('Unique constraint failed on the fields: (`referralCode`)');
          err.code = 'P2002';
          err.meta = { target: ['referralCode'] };
          return Promise.reject(err);
        }
      }

      const newUser = {
        id: `user-${mockDb.users.length + 1}`,
        createdAt: new Date(),
        ...data,
      };
      mockDb.users.push(newUser);
      return Promise.resolve(newUser);
    }),
    count: vi.fn().mockImplementation(() => Promise.resolve(mockDb.users.length || 15)),
    groupBy: vi.fn().mockResolvedValue([
      { collegeId: 'college-1', _count: { id: 10 } },
      { source: 'whatsapp', _count: { id: 10 } },
      { source: 'direct', _count: { id: 5 } },
    ]),
  },
  referral: {
    findUnique: vi.fn().mockResolvedValue(null),
    findFirst: vi.fn().mockImplementation(({ where }) => {
      if (where?.referredUserId && where?.campaignId) {
        const found = mockDb.referrals.find(
          (r) => r.referredUserId === where.referredUserId && r.campaignId === where.campaignId
        );
        return Promise.resolve(found || null);
      }
      return Promise.resolve(null);
    }),
    create: vi.fn().mockImplementation(({ data }) => {
      const newRef = {
        id: `ref-${mockDb.referrals.length + 1}`,
        createdAt: new Date(),
        ...data,
      };
      mockDb.referrals.push(newRef);
      return Promise.resolve(newRef);
    }),
    count: vi.fn().mockImplementation(() => Promise.resolve(mockDb.referrals.length || 5)),
  },
  adminUser: {
    findUnique: vi.fn().mockImplementation(({ where }) => {
      if (where?.email) {
        const found = mockDb.adminUsers.find((a) => a.email === where.email);
        return Promise.resolve(found || null);
      }
      if (where?.id) {
        const found = mockDb.adminUsers.find((a) => a.id === where.id);
        return Promise.resolve(found || null);
      }
      return Promise.resolve(null);
    }),
    findMany: vi.fn().mockImplementation(() => Promise.resolve(mockDb.adminUsers)),
    create: vi.fn().mockImplementation(({ data }) => {
      const newAdmin = {
        id: `admin-${mockDb.adminUsers.length + 1}`,
        createdAt: new Date(),
        ...data,
      };
      mockDb.adminUsers.push(newAdmin);
      return Promise.resolve(newAdmin);
    }),
    count: vi.fn().mockImplementation(() => Promise.resolve(mockDb.adminUsers.length)),
    upsert: vi.fn(),
  },
  $transaction: vi.fn().mockImplementation(async (cb) => {
    if (typeof cb === 'function') {
      const usersSnapshot = [...mockDb.users];
      const referralsSnapshot = [...mockDb.referrals];
      try {
        return await cb(mockPrisma);
      } catch (err) {
        mockDb.users = usersSnapshot;
        mockDb.referrals = referralsSnapshot;
        throw err;
      }
    }
    return Promise.resolve(cb);
  }),
  $queryRaw: vi.fn().mockImplementation((strings: TemplateStringsArray | string) => {
    const query = typeof strings === 'string' ? strings : Array.isArray(strings) ? strings.join(' ') : '';
    if (query.includes('referralCount') || query.includes('Referral') || query.includes('fullName')) {
      return Promise.resolve([
        {
          rank: 1,
          fullName: 'Rahul Sharma',
          collegeName: 'IIT Bombay',
          referralCount: 4,
        },
      ]);
    }
    return Promise.resolve([
      {
        rank: 1,
        collegeId: 'college-1',
        collegeName: 'IIT Bombay',
        city: 'Mumbai',
        state: 'Maharashtra',
        registrations: 25,
      },
    ]);
  }),
};

vi.mock('../../lib/prisma', () => ({
  prisma: mockPrisma,
  default: mockPrisma,
}));
