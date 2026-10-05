import { z } from 'zod';

export const registrationSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address format')
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .transform((val) => val.replace(/\s+/g, ''))
    .pipe(
      z
        .string()
        .regex(/^\+?[0-9]\d{9,14}$/, 'Invalid phone number format. Provide 10-15 digits with optional country code.')
    )
    .optional()
    .nullable(),
  collegeId: z
    .string({ required_error: 'College selection is required' })
    .uuid('Invalid college ID format'),
  graduationYear: z
    .number({ required_error: 'Graduation year is required' })
    .int('Graduation year must be an integer')
    .min(2024, 'Year must be 2024 or later')
    .max(2028, 'Year must be 2028 or earlier'),
  referralCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{6,8}$/, 'Referral code must be 6-8 uppercase alphanumeric characters')
    .optional()
    .nullable(),
  source: z
    .enum(['whatsapp', 'direct', 'linkedin', 'twitter', 'instagram', 'other'])
    .default('direct'),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

/**
 * Normalizes validated registration input.
 * Preserves leading '+' in phone numbers when present to retain standard E.164 semantics,
 * while stripping all non-digit characters (other than the leading '+') for consistent storage.
 */
export function normalizeRegistration(data: RegistrationInput) {
  const cleanedPhone = data.phone ? data.phone.replace(/[^\d+]/g, '') : null;

  return {
    ...data,
    emailNormalized: data.email.toLowerCase().trim(),
    phoneNormalized: cleanedPhone || null,
  };
}
