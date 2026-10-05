import { prisma } from '../lib/prisma';
import { RegistrationInput, normalizeRegistration } from '../validators/registration.validator';
import { generateReferralCode, buildReferralUrl } from '../utils/referralCode';
import {
  AppError,
  campaignClosed,
  emailAlreadyRegistered,
  phoneAlreadyRegistered,
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

  // 1. Fetch currently active campaign & verify valid campaign window
  const campaign = await prisma.campaign.findFirst({
    where: { status: 'active' },
    orderBy: { startsAt: 'desc' },
  });

  if (!campaign || campaign.status !== 'active' || (campaign.endsAt && new Date() > new Date(campaign.endsAt))) {
    throw campaignClosed();
  }

  // 2. Validate college exists
  const college = await prisma.college.findUnique({
    where: { id: normalized.collegeId },
  });

  if (!college) {
    throw validationError('Invalid college ID selected');
  }

  // 3. Validate referral code if provided (normalized uppercase lookup)
  let referrerUser: { id: string; emailNormalized: string; phoneNormalized: string | null } | null = null;
  if (normalized.referralCode) {
    const lookupCode = normalized.referralCode.trim().toUpperCase();
    referrerUser = await prisma.user.findUnique({
      where: { referralCode: lookupCode },
      select: { id: true, emailNormalized: true, phoneNormalized: true },
    });

    if (!referrerUser) {
      throw invalidReferralCode();
    }

    if (referrerUser.emailNormalized === normalized.emailNormalized) {
      throw selfReferral();
    }

    if (
      referrerUser.phoneNormalized &&
      normalized.phoneNormalized &&
      referrerUser.phoneNormalized === normalized.phoneNormalized
    ) {
      throw selfReferral();
    }
  }

  // 4. Execute atomic user registration and referral attribution with code retry on collision
  let createdUser: any = null;
  const maxCodeRetries = 5;

  for (let attempt = 0; attempt < maxCodeRetries; attempt++) {
    const newReferralCode = await generateReferralCode();

    try {
      createdUser = await prisma.$transaction(async (tx) => {
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
              referralCode: normalized.referralCode.trim().toUpperCase(),
              status: 'valid',
            },
          });
        }

        return user;
      });

      break; // Successfully created and committed
    } catch (e: any) {
      if (e.code === 'P2002') {
        const target = (e.meta?.target ?? []) as string[];
        const targetStr = (Array.isArray(target) ? target.join(' ') : String(target)) + ' ' + (e.message || '');
        if (targetStr.includes('referralCode')) {
          continue; // Referral code collision, retry with new code
        }
        if (targetStr.includes('emailNormalized') || targetStr.includes('email')) {
          throw emailAlreadyRegistered();
        }
        if (targetStr.includes('phoneNormalized') || targetStr.includes('phone')) {
          throw phoneAlreadyRegistered();
        }
      }
      throw e;
    }
  }

  if (!createdUser) {
    throw new AppError(
      'Failed to generate a unique referral code after multiple attempts',
      500,
      'REFERRAL_CODE_GENERATION_FAILED'
    );
  }

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
