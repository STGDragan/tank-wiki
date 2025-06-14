
CREATE OR REPLACE FUNCTION public.claim_admin_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_exists boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO admin_exists;
  
  IF admin_exists AND NOT (public.has_role(auth.uid(), 'admin')) THEN
    RETURN 'An admin already exists.';
  ELSIF (public.has_role(auth.uid(), 'admin')) THEN
    RETURN 'You are already an admin.';
  ELSE
    INSERT INTO public.user_roles(user_id, role) VALUES (auth.uid(), 'admin');
    RETURN 'Admin role claimed successfully.';
  END IF;
END;
$$;
