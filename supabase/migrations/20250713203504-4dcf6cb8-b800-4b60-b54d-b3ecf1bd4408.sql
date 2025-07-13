-- Update existing trader users with 2-year memberships to 1-year standard
-- This will adjust the membership_expires_at for users who currently have more than 1 year remaining

UPDATE public.profiles 
SET 
  membership_expires_at = CASE 
    -- If membership expires more than 1 year from now, set it to 1 year from now
    WHEN membership_expires_at > (NOW() + INTERVAL '1 year') THEN (NOW() + INTERVAL '1 year')
    -- Otherwise keep the existing expiry date (for users with less than 1 year remaining)
    ELSE membership_expires_at
  END,
  updated_at = NOW()
WHERE id IN (
  SELECT DISTINCT ur.user_id 
  FROM public.user_roles ur 
  WHERE ur.role = 'trader'
)
AND membership_expires_at IS NOT NULL
AND membership_expires_at > (NOW() + INTERVAL '1 year');