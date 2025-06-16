
-- Add admin override settings to profiles table
ALTER TABLE public.profiles 
ADD COLUMN admin_subscription_override BOOLEAN DEFAULT false,
ADD COLUMN admin_can_grant_subscriptions BOOLEAN DEFAULT false;

-- Create a table to track admin-granted free subscriptions
CREATE TABLE public.admin_granted_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  granted_to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by_admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier TEXT NOT NULL DEFAULT 'Pro',
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE public.admin_granted_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for admin-granted subscriptions
CREATE POLICY "Admins can manage granted subscriptions" 
ON public.admin_granted_subscriptions
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own granted subscription" 
ON public.admin_granted_subscriptions
FOR SELECT
USING (auth.uid() = granted_to_user_id);

-- Create a function to check if user has admin-granted subscription
CREATE OR REPLACE FUNCTION public.has_admin_granted_subscription(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_granted_subscriptions
    WHERE granted_to_user_id = _user_id 
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Update the trigger to handle updated_at
CREATE TRIGGER set_admin_granted_subscriptions_updated_at
BEFORE UPDATE ON public.admin_granted_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();
