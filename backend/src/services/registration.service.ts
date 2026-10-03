import { prisma } from '../lib/prisma';
import { RegistrationInput, normalizeRegistration } from '../validators/registration.validator';
import { generateReferralCode, buildReferralUrl } from '../utils/referralCode';
import {
  campaignClosed,
  emailAlreadyRegistered,
  invalidReferralCode,
  selfReferral,
  validationError,
} from '../utils/errors';

export interface PublicStudentResult {
  id: string;
  fullName: string;
  referralCode: string;
  referralUrl: string;
}

export interface RegisterResult {
  user: PublicStudentResult;
  isNew: boolean;
}

export async function registerStudent(input: RegistrationInput): Promise<RegisterResult> {
  const normalized = normalizeRegistration(input);

  // 1. Fetch currently active campaign
  const campaign = await prisma.campaign.findFirst({
    where: { status: 'active' },
    orderBy: { startsAt: 'desc' },
  });

  if (!campaign) {
    throw campaignClosed();
  }

  // 2. Validate college exists
  const college = await prisma.college.findUnique({
    where: { id: normalized.collegeId },
  });

  if (!college) {
    throw validationError('Invalid college ID selected');
  }

  // 3. Validate referral code if provided
  let referrerUser: { id: string; emailNormalized: string } | null = null;
  if (normalized.referralCode) {
    referrerUser = await prisma.user.findUnique({
      where: { referralCode: normalized.referralCode },
      select: { id: true, emailNormalized: true },
    });

    if (!referrerUser) {
      throw invalidReferralCode();
    }

    if (referrerUser.emailNormalized === normalized.emailNormalized) {
      throw selfReferral();
    }
  }

  // 4. Duplicate email prevention within campaign
  const existingUser = await prisma.user.findUnique({
    where: {
      campaignId_emailNormalized: {
        campaignId: campaign.id,
        emailNormalized: normalized.emailNormalized,
      },
    },
  });

  if (existingUser) {
    throw emailAlreadyRegistered();
  }

  // 5. Generate unique referral code
  const newReferralCode = await generateReferralCode();

  // 6. Execute atomic user registration and referral attribution
  const createdUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        campaignId: campaign.id,
        collegeId: college.id,
        fullName: normalized.fullName,
        email: normalized.email,
        emailNormalized: normalized.emailNormalized,
        phone: normalized.phone || null,
        phoneNormalized: normalized.phoneNormalized,
        graduationYear: normalized.graduationYear,
        referralCode: newReferralCode,
        referredByUserId: referrerUser ? referrerUser.id : null,
        source: normalized.source,
      },
    });

    // If referred by another student, record referral attribution
    if (referrerUser && normalized.referralCode) {
      await tx.referral.create({
        data: {
          campaignId: campaign.id,
          referrerUserId: referrerUser.id,
          referredUserId: user.id,
          referralCode: normalized.referralCode,
          status: 'valid',
        },
      });
    }

    return user;
  });

  const referralUrl = buildReferralUrl(createdUser.referralCode);

  return {
    user: {
      id: createdUser.id,
      fullName: createdUser.fullName,
      referralCode: createdUser.referralCode,
      referralUrl,
    },
    isNew: true,
  };
}
