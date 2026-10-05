import { z } from 'zod';

export const registrationSchema = z.preprocess(
  (val: any) => {
    if (val && typeof val === 'object') {
      const clone = { ...val };
      if (!clone.fullName && clone.name) clone.fullName = clone.name;
      return clone;
    }
    return val;
  },
  z.object({
    fullName: z
      .string({ required_error: 'Full name is required' })
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address format')
      .toLowerCase()
      .trim(),
    phone: z
      .string()
      .transform((val) => {
        const trimmed = val.trim().replace(/\s+/g, '');
        const hasLeadingPlus = trimmed.startsWith('+');
        const digits = trimmed.replace(/\D/g, '');
        if (!digits) return '';
        return hasLeadingPlus ? `+${digits}` : digits;
      })
      .pipe(
        z
          .string()
          .regex(
            /^(\+?[1-9]\d{9,14}|0\d{9,14})$/,
            'Provide 10-15 digits (E.164 with optional +) or a local number starting with 0'
          )
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
      .max(2030, 'Year must be 2030 or earlier'),
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
  })
);

export type RegistrationInput = z.infer<typeof registrationSchema>;

/**
 * Normalizes a phone number for storage and uniqueness checks.
 * - Strips all non-digit characters.
 * - Preserves a single leading '+' only if the input starts with '+'.
 * - Returns null for empty / non-numeric input.
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const hasLeadingPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return null;
  return hasLeadingPlus ? `+${digits}` : digits;
}

/**
 * Normalizes validated registration input.
 * Preserves leading '+' in phone numbers when present to retain standard E.164 semantics,
 * while stripping all non-digit characters (other than the leading '+') for consistent storage.
 */
export function normalizeRegistration(data: RegistrationInput) {
  return {
    ...data,
    emailNormalized: data.email.toLowerCase().trim(),
    phoneNormalized: normalizePhone(data.phone),
  };
}
