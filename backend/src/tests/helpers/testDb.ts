import { prisma } from '../../lib/prisma';

export let TEST_CAMPAIGN_ID = 'test-campaign-oct-2026';
export let TEST_COLLEGE_ID = '00000000-0000-0000-0000-000000000001';

export function makeTestRegistration(overrides: Record<string, any> = {}) {
  const randomSuffix = Math.floor(Math.random() * 1000000);
  return {
    fullName: 'Rahul Sharma',
    email: `student_${randomSuffix}@campus.edu`,
    phone: '+919876543210',
    collegeId: TEST_COLLEGE_ID,
    graduationYear: 2025,
    source: 'direct',
    ...overrides,
  };
}
