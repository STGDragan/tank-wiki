-- Fix remaining security warnings by updating functions with missing search paths

-- Fix the get_auth function
ALTER FUNCTION extensions.get_auth() SET search_path = '';

-- Fix functions with empty search paths to have proper ones
ALTER FUNCTION public.check_aquarium_permission(uuid, permission_level) SET search_path = 'public';

ALTER FUNCTION public.accept_aquarium_invitation(uuid) SET search_path = 'public';

ALTER FUNCTION public.handle_new_user() SET search_path = 'public';