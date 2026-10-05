-- Migration: 20261006000000_referral_campaign_isolation_and_integrity
-- Purpose:
-- 1. Enforce relational database invariant: referrer campaign == referral campaign == referred user campaign
-- 2. Add composite unique constraint on User(id, campaignId)
-- 3. Add composite foreign keys on Referral(referrerUserId, campaignId) and Referral(referredUserId, campaignId)
-- 4. Scope referred user uniqueness per campaign on Referral(referredUserId, campaignId)
-- 5. Align canonical graduation year check constraint to [2024, 2028]

-- 1. Add composite unique constraint on User(id, campaignId)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'User_id_campaignId_key'
    ) THEN
        ALTER TABLE public."User" ADD CONSTRAINT "User_id_campaignId_key" UNIQUE ("id", "campaignId");
    END IF;
END $$;

-- 2. Drop existing foreign keys and single-column unique constraint on Referral if present
ALTER TABLE public."Referral" DROP CONSTRAINT IF EXISTS "Referral_referrerUserId_fkey";
ALTER TABLE public."Referral" DROP CONSTRAINT IF EXISTS "Referral_referredUserId_fkey";
ALTER TABLE public."Referral" DROP CONSTRAINT IF EXISTS "Referral_referredUserId_key";

-- 3. Add composite unique constraint on Referral(referredUserId, campaignId)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Referral_referredUserId_campaignId_key'
    ) THEN
        ALTER TABLE public."Referral" ADD CONSTRAINT "Referral_referredUserId_campaignId_key" UNIQUE ("referredUserId", "campaignId");
    END IF;
END $$;

-- 4. Add composite foreign keys enforcing campaign isolation
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Referral_referrerUserId_campaignId_fkey'
    ) THEN
        ALTER TABLE public."Referral" 
        ADD CONSTRAINT "Referral_referrerUserId_campaignId_fkey" 
        FOREIGN KEY ("referrerUserId", "campaignId") 
        REFERENCES public."User"("id", "campaignId") 
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Referral_referredUserId_campaignId_fkey'
    ) THEN
        ALTER TABLE public."Referral" 
        ADD CONSTRAINT "Referral_referredUserId_campaignId_fkey" 
        FOREIGN KEY ("referredUserId", "campaignId") 
        REFERENCES public."User"("id", "campaignId") 
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- 5. Align graduation year check constraint (2024 to 2028)
ALTER TABLE public."User" DROP CONSTRAINT IF EXISTS "user_valid_graduation_year";
ALTER TABLE public."User" 
ADD CONSTRAINT "user_valid_graduation_year" 
CHECK ("graduationYear" >= 2024 AND "graduationYear" <= 2028);
