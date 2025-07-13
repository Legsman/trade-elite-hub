-- Clean up conflicting user roles - users should have only one verification role at a time
-- Remove 'unverified' role for users who have 'verified' or 'trader' roles

DELETE FROM public.user_roles 
WHERE role = 'unverified' 
AND user_id IN (
  SELECT DISTINCT user_id 
  FROM public.user_roles 
  WHERE role IN ('verified', 'trader')
);

-- Add 'unverified' role for users who have no verification roles
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT p.id, 'unverified'::user_role_type
FROM public.profiles p
WHERE p.id NOT IN (
  SELECT DISTINCT user_id 
  FROM public.user_roles 
  WHERE role IN ('unverified', 'verified', 'trader')
)
AND p.id NOT IN (
  SELECT DISTINCT user_id 
  FROM public.user_roles 
  WHERE role = 'admin'
);