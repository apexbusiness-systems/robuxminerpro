-- Phase 1: Fix Referral Policy - Restrict to only show referrals where user is the referrer
-- Drop existing policy
DROP POLICY IF EXISTS "Users can view referrals they made" ON public.referrals;

-- Create more restrictive policy that only shows referrals where user is the referrer
CREATE POLICY "Users can view referrals they made" 
ON public.referrals 
FOR SELECT 
TO authenticated
USING (auth.uid() = referrer_id);

-- Phase 2: Add Transaction Immutability - Explicit DENY policies
-- Explicitly deny updates to make immutability clear
CREATE POLICY "Transactions are immutable - no updates" 
ON public.transactions 
FOR UPDATE 
TO authenticated
USING (false);

-- Explicitly deny deletes to preserve audit trail
CREATE POLICY "Transactions are immutable - no deletes" 
ON public.transactions 
FOR DELETE 
TO authenticated
USING (false);

-- Add comment to document the security requirement
COMMENT ON TABLE public.transactions IS 'Immutable audit trail - transactions cannot be modified or deleted after creation';