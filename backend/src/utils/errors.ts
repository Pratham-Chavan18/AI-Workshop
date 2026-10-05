export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST', details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class CampaignClosedError extends AppError {
  constructor(msg = 'Campaign is currently closed or not accepting registrations') {
    super(msg, 410, 'CAMPAIGN_CLOSED');
  }
}

export class DuplicateEmailError extends AppError {
  constructor(msg = 'This email is already registered for the workshop') {
    super(msg, 409, 'EMAIL_ALREADY_REGISTERED');
  }
}

export class DuplicatePhoneError extends AppError {
  constructor(msg = 'This phone number is already registered for the workshop') {
    super(msg, 409, 'PHONE_ALREADY_REGISTERED');
  }
}

export class InvalidReferralCodeError extends AppError {
  constructor(msg = 'Invalid or non-existent referral code') {
    super(msg, 400, 'INVALID_REFERRAL_CODE');
  }
}

export class SelfReferralError extends AppError {
  constructor(msg = 'You cannot refer yourself') {
    super(msg, 400, 'SELF_REFERRAL');
  }
}

export const campaignClosed = (msg?: string): CampaignClosedError =>
  new CampaignClosedError(msg);

export const emailAlreadyRegistered = (msg?: string): DuplicateEmailError =>
  new DuplicateEmailError(msg);

export const phoneAlreadyRegistered = (msg?: string): DuplicatePhoneError =>
  new DuplicatePhoneError(msg);

export const invalidReferralCode = (msg?: string): InvalidReferralCodeError =>
  new InvalidReferralCodeError(msg);

export const selfReferral = (msg?: string): SelfReferralError =>
  new SelfReferralError(msg);

export const validationError = (msg = 'Validation failed', details?: unknown): AppError =>
  new AppError(msg, 400, 'VALIDATION_ERROR', details);

export const unauthorized = (msg = 'Unauthorized access'): AppError =>
  new AppError(msg, 401, 'UNAUTHORIZED');

export const forbidden = (msg = 'Forbidden: insufficient privileges'): AppError =>
  new AppError(msg, 403, 'FORBIDDEN');

export const notFound = (msg = 'Resource not found'): AppError =>
  new AppError(msg, 404, 'NOT_FOUND');

