
-- Create the aquarium_wizard_progress table to store wizard data and progress
CREATE TABLE public.aquarium_wizard_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aquarium_id UUID NOT NULL REFERENCES public.aquariums(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  wizard_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_steps TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.aquarium_wizard_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the wizard progress table
CREATE POLICY "Users can view their own wizard progress" 
  ON public.aquarium_wizard_progress 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wizard progress" 
  ON public.aquarium_wizard_progress 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wizard progress" 
  ON public.aquarium_wizard_progress 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wizard progress" 
  ON public.aquarium_wizard_progress 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_aquarium_wizard_progress_updated_at
  BEFORE UPDATE ON public.aquarium_wizard_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
