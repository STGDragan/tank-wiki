
-- Create user preferences table for units of measure and other settings
CREATE TABLE public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  units_volume text NOT NULL DEFAULT 'gallons' CHECK (units_volume IN ('gallons', 'liters')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS for user preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user preferences
CREATE POLICY "Users can view their own preferences" 
  ON public.user_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
  ON public.user_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
  ON public.user_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create activity logs table for comprehensive logging
CREATE TABLE public.activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  aquarium_id uuid NOT NULL REFERENCES public.aquariums(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('water_change', 'water_test', 'filter_clean', 'livestock_add', 'equipment_install', 'maintenance', 'note')),
  title text NOT NULL,
  description text,
  data jsonb DEFAULT '{}',
  image_url text,
  logged_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for activity logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for activity logs
CREATE POLICY "Users can view their own activity logs" 
  ON public.activity_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs" 
  ON public.activity_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity logs" 
  ON public.activity_logs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity logs" 
  ON public.activity_logs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger to update timestamps
CREATE OR REPLACE FUNCTION update_activity_logs_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_activity_logs_updated_at_trigger
  BEFORE UPDATE ON public.activity_logs
  FOR EACH ROW EXECUTE FUNCTION update_activity_logs_updated_at();

-- Add trigger to update user preferences timestamps
CREATE TRIGGER update_user_preferences_updated_at_trigger
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_activity_logs_updated_at();
