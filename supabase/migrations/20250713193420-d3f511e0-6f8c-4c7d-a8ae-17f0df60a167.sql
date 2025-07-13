-- Create migration to backfill membership data for existing verified users
-- Set membership_expires_at for all verified users who don't have it set

-- Update verified users (not traders) to have 1 year membership from their verification date or signup date
UPDATE public.profiles 
SET 
  membership_expires_at = CASE 
    WHEN signup_date IS NOT NULL THEN signup_date + INTERVAL '1 year'
    ELSE created_at + INTERVAL '1 year'
  END,
  membership_status = 'active',
  last_payment_date = CASE 
    WHEN signup_date IS NOT NULL THEN signup_date
    ELSE created_at
  END
WHERE id IN (
  SELECT DISTINCT ur.user_id 
  FROM public.user_roles ur 
  WHERE ur.role = 'verified'
  AND ur.user_id NOT IN (
    SELECT ur2.user_id 
    FROM public.user_roles ur2 
    WHERE ur2.role = 'trader'
  )
)
AND membership_expires_at IS NULL;

-- Update trader users to have 2 years membership from their verification date or signup date
UPDATE public.profiles 
SET 
  membership_expires_at = CASE 
    WHEN signup_date IS NOT NULL THEN signup_date + INTERVAL '2 years'
    ELSE created_at + INTERVAL '2 years'
  END,
  membership_status = 'active',
  last_payment_date = CASE 
    WHEN signup_date IS NOT NULL THEN signup_date
    ELSE created_at
  END
WHERE id IN (
  SELECT DISTINCT ur.user_id 
  FROM public.user_roles ur 
  WHERE ur.role = 'trader'
)
AND membership_expires_at IS NULL;