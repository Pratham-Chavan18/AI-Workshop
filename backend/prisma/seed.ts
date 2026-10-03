import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { COLLEGES } from './colleges-data';

const prisma = new PrismaClient();

export function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed or update active Campaign
  const campaign = await prisma.campaign.upsert({
    where: { slug: 'ai60-oct-2026' },
    update: {
      status: 'active',
      targetRegistrations: 500,
    },
    create: {
      name: 'Build Your First AI Project in 60 Minutes',
      slug: 'ai60-oct-2026',
      targetRegistrations: 500,
      startsAt: new Date('2026-10-04T00:00:00.000Z'),
      endsAt: new Date('2026-10-11T23:59:59.000Z'),
      status: 'active',
    },
  });
  console.log(`✅ Campaign verified: ${campaign.name} (${campaign.slug})`);

  // 2. Seed Colleges
  let collegesCount = 0;
  for (const c of COLLEGES) {
    const norm = normalizeName(c.name);
    await prisma.college.upsert({
      where: { nameNormalized: norm },
      update: {
        city: c.city,
        state: c.state,
      },
      create: {
        name: c.name,
        nameNormalized: norm,
        city: c.city,
        state: c.state,
      },
    });
    collegesCount++;
  }
  console.log(`✅ Upserted ${collegesCount} colleges.`);

  // 3. Seed default Admin User
  const defaultAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@ai60!';
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@ai60.nxtwave.com' },
    update: {
      passwordHash: hashPassword(defaultAdminPassword),
      role: 'operator',
    },
    create: {
      email: 'admin@ai60.nxtwave.com',
      passwordHash: hashPassword(defaultAdminPassword),
      role: 'operator',
    },
  });
  console.log(`✅ Admin user seeded: ${admin.email} (${admin.role})`);

  console.log('Seed complete', {
    campaign: campaign.slug,
    colleges: collegesCount,
    adminEmail: admin.email,
  });
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
