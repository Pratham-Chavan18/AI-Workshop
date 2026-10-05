import { describe, it, expect } from 'vitest';
import './helpers/mockPrisma';
import request from 'supertest';
import { app } from '../app';
import { registrationSchema, normalizeRegistration } from '../validators/registration.validator';

describe('Registration Validator & API Tests', () => {
  it('should validate and normalize valid registration payload', () => {
    const raw = {
      fullName: 'Pratham Chavan',
      email: 'pratham@gmail.com',
      phone: '+919876543210',
      collegeId: '123e4567-e89b-12d3-a456-426614174000',
      graduationYear: 2025,
      referralCode: 'AI60X1',
      source: 'direct',
    };

    const parsed = registrationSchema.parse(raw);
    const normalized = normalizeRegistration(parsed);

    expect(normalized.emailNormalized).toBe('pratham@gmail.com');
    expect(normalized.phoneNormalized).toBe('+919876543210');
    expect(normalized.fullName).toBe('Pratham Chavan');
  });

  describe('Phone number validation & normalization', () => {
    const basePayload = {
      fullName: 'Pratham Chavan',
      email: 'student@example.com',
      collegeId: '123e4567-e89b-12d3-a456-426614174000',
      graduationYear: 2025,
    };

    it('should accept E.164 phone numbers with leading plus: +919876543210', () => {
      const parsed = registrationSchema.parse({ ...basePayload, phone: '+919876543210' });
      const normalized = normalizeRegistration(parsed);
      expect(normalized.phoneNormalized).toBe('+919876543210');
    });

    it('should accept local phone numbers with leading zero: 09876543210', () => {
      const parsed = registrationSchema.parse({ ...basePayload, phone: '09876543210' });
      const normalized = normalizeRegistration(parsed);
      expect(normalized.phoneNormalized).toBe('09876543210');
    });

    it('should reject invalid non-numeric phone: abc123', () => {
      const result = registrationSchema.safeParse({ ...basePayload, phone: 'abc123' });
      expect(result.success).toBe(false);
    });
  });

  describe('Referral code normalization', () => {
    const basePayload = {
      fullName: 'Pratham Chavan',
      email: 'student@example.com',
      collegeId: '123e4567-e89b-12d3-a456-426614174000',
      graduationYear: 2025,
    };

    it('should normalize lowercase referral codes to uppercase', () => {
      const parsed = registrationSchema.parse({ ...basePayload, referralCode: 'ab12cd' });
      expect(parsed.referralCode).toBe('AB12CD');
    });

    it('should normalize whitespace-padded referral codes', () => {
      const parsed = registrationSchema.parse({ ...basePayload, referralCode: '  AI60X1  ' });
      expect(parsed.referralCode).toBe('AI60X1');
    });

    it('should normalize lowercase and whitespace-padded referral code: "  ab12cd "', () => {
      const parsed = registrationSchema.parse({ ...basePayload, referralCode: '  ab12cd ' });
      expect(parsed.referralCode).toBe('AB12CD');
    });
  });

  it('should reject invalid email addresses with ZodError', () => {
    const invalid = {
      fullName: 'Test User',
      email: 'not-an-email',
      collegeId: '123e4567-e89b-12d3-a456-426614174000',
      graduationYear: 2025,
    };

    const result = registrationSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject invalid collegeId format', () => {
    const invalid = {
      fullName: 'Test User',
      email: 'user@test.com',
      collegeId: 'not-a-uuid',
      graduationYear: 2025,
    };

    const result = registrationSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject graduation year outside 2024-2028', () => {
    const invalid = {
      fullName: 'Test User',
      email: 'user@test.com',
      collegeId: '123e4567-e89b-12d3-a456-426614174000',
      graduationYear: 2030,
    };

    const result = registrationSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should return HTTP 400 when required fields are missing on POST /api/v1/registrations', async () => {
    const res = await request(app)
      .post('/api/v1/registrations')
      .send({ email: 'bad' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
