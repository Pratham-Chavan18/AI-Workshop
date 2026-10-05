import { vi } from 'vitest';

export const mockPrisma = {
  campaign: {
    findFirst: vi.fn().mockResolvedValue({
      id: 'test-campaign-id',
      name: 'Build Your First AI Project in 60 Minutes',
      slug: 'ai60-oct-2026',
      targetRegistrations: 500,
      startsAt: new Date('2026-10-04'),
      endsAt: new Date('2026-11-04'),
      status: 'active',
    }),
    findUnique: vi.fn().mockResolvedValue({
      id: 'test-campaign-id',
      name: 'Build Your First AI Project in 60 Minutes',
      slug: 'ai60-oct-2026',
      targetRegistrations: 500,
      startsAt: new Date('2026-10-04'),
      endsAt: new Date('2026-11-04'),
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
    findUnique: vi.fn().mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'IIT Bombay',
      city: 'Mumbai',
      state: 'Maharashtra',
    }),
    upsert: vi.fn(),
  },
  user: {
    findFirst: vi.fn().mockResolvedValue(null),
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(({ data }) =>
      Promise.resolve({
        id: 'new-user-id',
        ...data,
      })
    ),
    count: vi.fn().mockResolvedValue(15),
    groupBy: vi.fn().mockResolvedValue([
      { collegeId: 'college-1', _count: { id: 10 } },
      { source: 'whatsapp', _count: { id: 10 } },
      { source: 'direct', _count: { id: 5 } },
    ]),
  },
  referral: {
    findUnique: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockImplementation(({ data }) =>
      Promise.resolve({
        id: 'new-referral-id',
        ...data,
      })
    ),
    count: vi.fn().mockResolvedValue(5),
  },
  adminUser: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  $transaction: vi.fn().mockImplementation((cb) => {
    if (typeof cb === 'function') {
      return cb(mockPrisma);
    }
    return Promise.resolve(cb);
  }),
  $queryRaw: vi.fn().mockImplementation((strings: TemplateStringsArray | string) => {
    const query = typeof strings === 'string' ? strings : Array.isArray(strings) ? strings.join(' ') : '';
    if (query.includes('referralCount') || query.includes('Referral') || query.includes('fullName')) {
      return Promise.resolve([
        {
          rank: 1,
          userId: 'user-1',
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
