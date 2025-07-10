-- Update the user_role_type enum to include 'trader' status
ALTER TYPE public.user_role_type ADD VALUE 'trader';

-- Add a comment to document the three-tier system
COMMENT ON TYPE public.user_role_type IS 'Three-tier user verification system: unverified (browse only), verified (basic privileges), trader (full privileges)';

-- Create index on user_roles table for better performance when checking roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON public.user_roles(user_id, role);

-- Update the get_user_roles_batch function to include trader status
CREATE OR REPLACE FUNCTION public.get_user_roles_batch(user_ids uuid[])
RETURNS TABLE(user_id uuid, is_admin boolean, is_verified boolean, is_trader boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    input_users.id AS user_id,
    EXISTS (
      SELECT 1 FROM public.user_roles ur1
      WHERE ur1.user_id = input_users.id AND ur1.role = 'admin'
    ) AS is_admin,
    EXISTS (
      SELECT 1 FROM public.user_roles ur2
      WHERE ur2.user_id = input_users.id AND ur2.role IN ('verified', 'trader')
    ) AS is_verified,
    EXISTS (
      SELECT 1 FROM public.user_roles ur3
      WHERE ur3.user_id = input_users.id AND ur3.role = 'trader'
    ) AS is_trader
  FROM UNNEST(user_ids) AS input_users(id);
END;
$function$;

-- Create helper function to get user verification level
CREATE OR REPLACE FUNCTION public.get_user_verification_level(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_level text := 'unverified';
BEGIN
  -- Check for trader status first (highest level)
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = 'trader'
  ) THEN
    RETURN 'trader';
  END IF;
  
  -- Check for verified status
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = 'verified'
  ) THEN
    RETURN 'verified';
  END IF;
  
  -- Default to unverified
  RETURN 'unverified';
END;
$function$;