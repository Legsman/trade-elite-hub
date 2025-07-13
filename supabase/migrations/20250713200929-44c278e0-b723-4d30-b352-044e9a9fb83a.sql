-- Fix infinite recursion in user_roles RLS policies
-- Drop conflicting policies and create clean, non-recursive ones

-- Drop all existing policies on user_roles to start fresh
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can see all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update any" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Insert self as unverified (default), admin can assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Unrestricted access to user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users and admins can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can create roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can see own roles" ON public.user_roles;

-- Create simplified, non-recursive policies
-- Users can view their own roles
CREATE POLICY "Users can view own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

-- Users can create their own unverified role (for new signups)
CREATE POLICY "Users can create unverified role" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (user_id = auth.uid() AND role = 'unverified');

-- Service role can do everything (for admin functions and edge functions)
CREATE POLICY "Service role full access" 
ON public.user_roles 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- Admin users can view all roles (using the is_admin function which is security definer)
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Admin users can manage all roles
CREATE POLICY "Admins can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Create a more efficient function for getting membership data for admins
CREATE OR REPLACE FUNCTION get_membership_data_for_admin()
RETURNS TABLE(
  user_id uuid,
  full_name text,
  email text,
  membership_expires_at timestamp with time zone,
  membership_status text,
  last_payment_date timestamp with time zone,
  grace_period_until timestamp with time zone,
  signup_date timestamp with time zone,
  created_at timestamp with time zone,
  verification_level text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to call this function
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: admin privileges required';
  END IF;

  RETURN QUERY
  SELECT DISTINCT
    p.id as user_id,
    p.full_name,
    p.email,
    p.membership_expires_at,
    p.membership_status,
    p.last_payment_date,
    p.grace_period_until,
    p.signup_date,
    p.created_at,
    CASE 
      WHEN EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id AND ur.role = 'trader') THEN 'trader'
      WHEN EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id AND ur.role = 'verified') THEN 'verified'
      ELSE 'unverified'
    END as verification_level
  FROM profiles p
  WHERE EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = p.id 
    AND ur.role IN ('verified', 'trader')
  )
  ORDER BY p.full_name;
END;
$$;