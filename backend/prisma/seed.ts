import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const COLLEGES_DATA = [
  { name: 'Indian Institute of Technology Bombay', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'Indian Institute of Technology Delhi', city: 'New Delhi', state: 'Delhi' },
  { name: 'Indian Institute of Technology Madras', city: 'Chennai', state: 'Tamil Nadu' },
  { name: 'Indian Institute of Technology Kharagpur', city: 'Kharagpur', state: 'West Bengal' },
  { name: 'Indian Institute of Technology Kanpur', city: 'Kanpur', state: 'Uttar Pradesh' },
  { name: 'Indian Institute of Technology Roorkee', city: 'Roorkee', state: 'Uttarakhand' },
  { name: 'Indian Institute of Technology Guwahati', city: 'Guwahati', state: 'Assam' },
  { name: 'Indian Institute of Technology Hyderabad', city: 'Hyderabad', state: 'Telangana' },
  { name: 'National Institute of Technology Tiruchirappalli', city: 'Tiruchirappalli', state: 'Tamil Nadu' },
  { name: 'National Institute of Technology Karnataka', city: 'Surathkal', state: 'Karnataka' },
  { name: 'National Institute of Technology Rourkela', city: 'Rourkela', state: 'Odisha' },
  { name: 'National Institute of Technology Warangal', city: 'Warangal', state: 'Telangana' },
  { name: 'National Institute of Technology Calicut', city: 'Calicut', state: 'Kerala' },
  { name: 'BITS Pilani - Pilani Campus', city: 'Pilani', state: 'Rajasthan' },
  { name: 'BITS Pilani - Hyderabad Campus', city: 'Hyderabad', state: 'Telangana' },
  { name: 'BITS Pilani - Goa Campus', city: 'Goa', state: 'Goa' },
  { name: 'International Institute of Information Technology Hyderabad', city: 'Hyderabad', state: 'Telangana' },
  { name: 'International Institute of Information Technology Bangalore', city: 'Bangalore', state: 'Karnataka' },
  { name: 'Delhi Technological University', city: 'Delhi', state: 'Delhi' },
  { name: 'Netaji Subhas University of Technology', city: 'Delhi', state: 'Delhi' },
  { name: 'Vellore Institute of Technology', city: 'Vellore', state: 'Tamil Nadu' },
  { name: 'SRM Institute of Science and Technology', city: 'Chennai', state: 'Tamil Nadu' },
  { name: 'Thapar Institute of Engineering and Technology', city: 'Patiala', state: 'Punjab' },
  { name: 'Manipal Institute of Technology', city: 'Manipal', state: 'Karnataka' },
  { name: 'PSG College of Technology', city: 'Coimbatore', state: 'Tamil Nadu' },
  { name: 'College of Engineering Guindy', city: 'Chennai', state: 'Tamil Nadu' },
  { name: 'College of Engineering Pune', city: 'Pune', state: 'Maharashtra' },
  { name: 'Jadavpur University - Faculty of Engineering', city: 'Kolkata', state: 'West Bengal' },
  { name: 'Osmania University College of Engineering', city: 'Hyderabad', state: 'Telangana' },
  { name: 'Chaitanya Bharathi Institute of Technology', city: 'Hyderabad', state: 'Telangana' },
];

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
    where: { slug: 'ai-60-mins' },
    update: {
      status: 'active',
      targetRegistrations: 500,
    },
    create: {
      name: 'Build Your First AI Project in 60 Minutes',
      slug: 'ai-60-mins',
      targetRegistrations: 500,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      status: 'active',
    },
  });
  console.log(`✅ Campaign created/verified: ${campaign.name} (${campaign.id})`);

  // 2. Seed Colleges
  let collegesCount = 0;
  for (const c of COLLEGES_DATA) {
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
  console.log(`✅ Seeded ${collegesCount} engineering colleges.`);

  // 3. Seed default Admin User
  const defaultAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'NxtWaveAdmin2026!';
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@nxtwave.tech' },
    update: {
      passwordHash: hashPassword(defaultAdminPassword),
      role: 'admin',
    },
    create: {
      email: 'admin@nxtwave.tech',
      passwordHash: hashPassword(defaultAdminPassword),
      role: 'admin',
    },
  });
  console.log(`✅ Admin user seeded: ${admin.email} (${admin.role})`);

  console.log('✨ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
