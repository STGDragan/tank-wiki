
-- Drop the function to claim admin role, as it's no longer needed
DROP FUNCTION IF EXISTS public.claim_admin_role();

-- Create a function to check if an admin role has been claimed
CREATE OR REPLACE FUNCTION public.admin_role_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if any user has the 'admin' role
  RETURN EXISTS(SELECT 1 FROM public.user_roles WHERE role = 'admin');
END;
$$;
