-- Migration: 20261005000000_enable_rls_and_security_hardening
-- Purpose: Resolve Supabase Security Advisor findings "RLS Disabled in Public"
-- Description:
-- 1. Enable Row Level Security (RLS) on all public schema application tables
-- 2. Revoke direct PostgREST access from anon and authenticated roles on sensitive tables (User, Referral, AdminUser)
-- 3. Define least-privilege read-only policies for public catalog tables (College, active Campaign)
-- 4. Enforce database-level check constraints to prevent self-referrals and invalid graduation years

-- 1. Enable RLS on all public schema tables
ALTER TABLE public."Campaign" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."College" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Referral" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AdminUser" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = '_prisma_migrations'
    ) THEN
        EXECUTE 'ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;';
    END IF;
END $$;

-- 2. Revoke permissions from anon and authenticated on private tables
REVOKE ALL ON TABLE public."AdminUser" FROM anon, authenticated;
REVOKE ALL ON TABLE public."User" FROM anon, authenticated;
REVOKE ALL ON TABLE public."Referral" FROM anon, authenticated;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = '_prisma_migrations'
    ) THEN
        EXECUTE 'REVOKE ALL ON TABLE public."_prisma_migrations" FROM anon, authenticated;';
    END IF;
END $$;

-- 3. College permissions and policy (safe public directory)
GRANT SELECT ON TABLE public."College" TO anon, authenticated;

DROP POLICY IF EXISTS "allow_public_read_colleges" ON public."College";
CREATE POLICY "allow_public_read_colleges" 
    ON public."College" 
    FOR SELECT 
    TO anon, authenticated 
    USING (true);

-- 4. Campaign permissions and policy (safe active campaigns only)
GRANT SELECT ON TABLE public."Campaign" TO anon, authenticated;

DROP POLICY IF EXISTS "allow_public_read_active_campaigns" ON public."Campaign";
CREATE POLICY "allow_public_read_active_campaigns" 
    ON public."Campaign" 
    FOR SELECT 
    TO anon, authenticated 
    USING (status = 'active');

-- 5. Grant full access to postgres and service_role
GRANT ALL ON TABLE public."Campaign" TO postgres, service_role;
GRANT ALL ON TABLE public."College" TO postgres, service_role;
GRANT ALL ON TABLE public."User" TO postgres, service_role;
GRANT ALL ON TABLE public."Referral" TO postgres, service_role;
GRANT ALL ON TABLE public."AdminUser" TO postgres, service_role;

-- 6. Integrity check constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_no_self_referral'
    ) THEN
        ALTER TABLE public."User" 
        ADD CONSTRAINT "user_no_self_referral" 
        CHECK ("id" != "referredByUserId");
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'referral_no_self_referral'
    ) THEN
        ALTER TABLE public."Referral" 
        ADD CONSTRAINT "referral_no_self_referral" 
        CHECK ("referrerUserId" != "referredUserId");
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_valid_graduation_year'
    ) THEN
        ALTER TABLE public."User" 
        ADD CONSTRAINT "user_valid_graduation_year" 
        CHECK ("graduationYear" >= 2024 AND "graduationYear" <= 2030);
    END IF;
END $$;
