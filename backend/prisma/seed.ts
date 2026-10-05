import { PrismaClient } from '@prisma/client';
import { COLLEGES } from './colleges-data';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

export function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
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

  // 3. Bootstrap initial Admin User if environment variables are provided
  // Production rules:
  // - Never overwrite existing admin credentials
  // - Never seed a default/hardcoded password
  // - Require explicit ADMIN_BOOTSTRAP_EMAIL & ADMIN_BOOTSTRAP_PASSWORD
  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || process.env.ADMIN_EMAIL;
  const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || process.env.ADMIN_PASSWORD;
  const bootstrapRole = (process.env.ADMIN_BOOTSTRAP_ROLE as 'admin' | 'operator' | 'viewer') || 'admin';

  const existingAdminCount = await prisma.adminUser.count();

  if (existingAdminCount === 0) {
    if (!bootstrapPassword) {
      console.error('❌ Failed to seed admin: ADMIN_PASSWORD (or ADMIN_BOOTSTRAP_PASSWORD) environment variable is required.');
      process.exit(1);
    }
    const email = (bootstrapEmail || 'admin@aiworkshop.nxtwave.com').toLowerCase().trim();
    if (bootstrapPassword.length < 12) {
      console.error('❌ ADMIN_PASSWORD must be at least 12 characters.');
      process.exit(1);
    }
    const hashedPassword = await hashPassword(bootstrapPassword);
    const createdAdmin = await prisma.adminUser.create({
      data: {
        email,
        passwordHash: hashedPassword,
        role: bootstrapRole,
      },
    });
    console.log(`✅ Bootstrapped initial admin user: ${createdAdmin.email} with role: ${createdAdmin.role}`);
  } else {
    console.log('ℹ️ Admin already exists, skipping admin creation.');
  }

  console.log('Seed complete', {
    campaign: campaign.slug,
    colleges: collegesCount,
    adminAccounts: existingAdminCount > 0 ? existingAdminCount : (bootstrapEmail ? 1 : 0),
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

