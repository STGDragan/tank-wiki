-- Create table to track subscription downgrades and aquarium migrations
CREATE TABLE public.subscription_downgrades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  downgrade_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  previous_tier TEXT,
  reason TEXT, -- 'payment_failed', 'cancelled', 'expired'
  aquarium_limit INTEGER NOT NULL DEFAULT 3,
  migration_required BOOLEAN NOT NULL DEFAULT false,
  migration_completed BOOLEAN NOT NULL DEFAULT false,
  selected_aquarium_ids UUID[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_downgrades ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own downgrades" 
ON public.subscription_downgrades 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own downgrades" 
ON public.subscription_downgrades 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert downgrades" 
ON public.subscription_downgrades 
FOR INSERT 
WITH CHECK (true);

-- Create function to handle subscription downgrade
CREATE OR REPLACE FUNCTION public.handle_subscription_downgrade(
  p_user_id UUID,
  p_previous_tier TEXT DEFAULT NULL,
  p_reason TEXT DEFAULT 'payment_failed'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  downgrade_id UUID;
  aquarium_count INTEGER;
BEGIN
  -- Count user's aquariums
  SELECT COUNT(*) INTO aquarium_count
  FROM public.aquariums
  WHERE user_id = p_user_id;
  
  -- Insert downgrade record
  INSERT INTO public.subscription_downgrades (
    user_id,
    previous_tier,
    reason,
    migration_required,
    aquarium_limit
  ) VALUES (
    p_user_id,
    p_previous_tier,
    p_reason,
    aquarium_count > 3,
    3
  ) RETURNING id INTO downgrade_id;
  
  RETURN downgrade_id;
END;
$$;

-- Create function to complete aquarium migration
CREATE OR REPLACE FUNCTION public.complete_aquarium_migration(
  p_user_id UUID,
  p_selected_aquarium_ids UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update downgrade record
  UPDATE public.subscription_downgrades
  SET 
    selected_aquarium_ids = p_selected_aquarium_ids,
    migration_completed = true,
    updated_at = now()
  WHERE user_id = p_user_id 
    AND migration_completed = false;
  
  -- Archive non-selected aquariums (set them as inactive)
  UPDATE public.aquariums
  SET name = name || ' (Archived)'
  WHERE user_id = p_user_id
    AND id != ALL(p_selected_aquarium_ids);
    
  -- You could also move them to an archived table or delete them
  -- depending on your business requirements
END;
$$;