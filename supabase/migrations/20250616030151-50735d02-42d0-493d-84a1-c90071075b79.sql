
-- Create an audit log table to track all admin actions
CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action_type text NOT NULL,
  target_type text NOT NULL, -- 'user_role', 'subscription_override', 'granted_subscription', etc.
  target_id text, -- The ID of the affected record
  old_values jsonb,
  new_values jsonb,
  metadata jsonb, -- Additional context like IP, user agent, etc.
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  _action_type text,
  _target_type text,
  _target_id text DEFAULT NULL,
  _old_values jsonb DEFAULT NULL,
  _new_values jsonb DEFAULT NULL,
  _metadata jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action_type,
    target_type,
    target_id,
    old_values,
    new_values,
    metadata
  ) VALUES (
    auth.uid(),
    _action_type,
    _target_type,
    _target_id,
    _old_values,
    _new_values,
    _metadata
  );
END;
$$;

-- Create trigger function to automatically log role changes
CREATE OR REPLACE FUNCTION public.audit_user_roles_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_admin_action(
      'INSERT',
      'user_role',
      NEW.id::text,
      NULL,
      to_jsonb(NEW),
      jsonb_build_object('table', 'user_roles')
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_admin_action(
      'UPDATE',
      'user_role',
      NEW.id::text,
      to_jsonb(OLD),
      to_jsonb(NEW),
      jsonb_build_object('table', 'user_roles')
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_admin_action(
      'DELETE',
      'user_role',
      OLD.id::text,
      to_jsonb(OLD),
      NULL,
      jsonb_build_object('table', 'user_roles')
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger function to automatically log subscription override changes
CREATE OR REPLACE FUNCTION public.audit_subscription_override_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND 
     (OLD.admin_subscription_override IS DISTINCT FROM NEW.admin_subscription_override) THEN
    PERFORM public.log_admin_action(
      'UPDATE',
      'subscription_override',
      NEW.id::text,
      jsonb_build_object('admin_subscription_override', OLD.admin_subscription_override),
      jsonb_build_object('admin_subscription_override', NEW.admin_subscription_override),
      jsonb_build_object('table', 'profiles')
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger function to automatically log granted subscription changes
CREATE OR REPLACE FUNCTION public.audit_granted_subscriptions_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_admin_action(
      'INSERT',
      'granted_subscription',
      NEW.id::text,
      NULL,
      to_jsonb(NEW),
      jsonb_build_object('table', 'admin_granted_subscriptions')
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_admin_action(
      'UPDATE',
      'granted_subscription',
      NEW.id::text,
      to_jsonb(OLD),
      to_jsonb(NEW),
      jsonb_build_object('table', 'admin_granted_subscriptions')
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_admin_action(
      'DELETE',
      'granted_subscription',
      OLD.id::text,
      to_jsonb(OLD),
      NULL,
      jsonb_build_object('table', 'admin_granted_subscriptions')
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create the triggers
CREATE TRIGGER audit_user_roles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_user_roles_changes();

CREATE TRIGGER audit_subscription_override_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_subscription_override_changes();

CREATE TRIGGER audit_granted_subscriptions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.admin_granted_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.audit_granted_subscriptions_changes();
