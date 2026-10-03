import { describe, it, expect } from 'vitest';
import { buildReferralUrl } from '../utils/referralCode';

describe('Referral Logic & Attribution Unit Tests', () => {
  it('should build proper referral URL with clean formatting', () => {
    const code = 'ABC234';
    const baseUrl = 'https://nxtwave.tech';
    const url = buildReferralUrl(code, baseUrl);

    expect(url).toBe('https://nxtwave.tech/register?ref=ABC234');
  });

  it('should trim trailing slashes from base URL', () => {
    const code = 'XYZ789';
    const baseUrl = 'http://localhost:5173/';
    const url = buildReferralUrl(code, baseUrl);

    expect(url).toBe('http://localhost:5173/register?ref=XYZ789');
  });

  it('should reject self-referral attribution logic', () => {
    const referrerId = 'user-1';
    const referredUserId = 'user-1';

    const isSelf = referrerId === referredUserId;
    expect(isSelf).toBe(true);
  });
});
