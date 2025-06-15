
-- Create subscribers table to track subscription information
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own subscription info
CREATE POLICY "Users can view their own subscription" ON public.subscribers
FOR SELECT
USING (auth.uid() = user_id);

-- Policies for service role key access (used by edge functions)
CREATE POLICY "Allow service role to insert subscriptions" ON public.subscribers
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow service role to update subscriptions" ON public.subscribers
FOR UPDATE
USING (true);

-- Create trigger to update `updated_at` timestamp on update
CREATE TRIGGER set_subscribers_updated_at
BEFORE UPDATE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();
