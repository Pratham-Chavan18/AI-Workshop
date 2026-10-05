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

export const campaignClosed = (msg = 'Campaign is currently closed or not accepting registrations'): AppError =>
  new AppError(msg, 410, 'CAMPAIGN_CLOSED');

export const emailAlreadyRegistered = (msg = 'This email is already registered for the workshop'): AppError =>
  new AppError(msg, 409, 'EMAIL_ALREADY_REGISTERED');

export const phoneAlreadyRegistered = (msg = 'This phone number is already registered for the workshop'): AppError =>
  new AppError(msg, 409, 'PHONE_ALREADY_REGISTERED');

export const invalidReferralCode = (msg = 'Invalid or non-existent referral code'): AppError =>
  new AppError(msg, 400, 'INVALID_REFERRAL_CODE');

export const selfReferral = (msg = 'You cannot refer yourself'): AppError =>
  new AppError(msg, 400, 'SELF_REFERRAL');

export const validationError = (msg = 'Validation failed', details?: unknown): AppError =>
  new AppError(msg, 400, 'VALIDATION_ERROR', details);

export const unauthorized = (msg = 'Unauthorized access'): AppError =>
  new AppError(msg, 401, 'UNAUTHORIZED');

export const forbidden = (msg = 'Forbidden: insufficient privileges'): AppError =>
  new AppError(msg, 403, 'FORBIDDEN');

export const notFound = (msg = 'Resource not found'): AppError =>
  new AppError(msg, 404, 'NOT_FOUND');
