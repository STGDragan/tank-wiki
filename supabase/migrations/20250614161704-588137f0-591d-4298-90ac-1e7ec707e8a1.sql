
-- Create a table for maintenance tasks
CREATE TABLE public.maintenance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aquarium_id UUID NOT NULL REFERENCES public.aquariums(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE SET NULL,
  task TEXT NOT NULL,
  notes TEXT,
  due_date DATE,
  completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add comments to explain columns
COMMENT ON TABLE public.maintenance IS 'Tracks maintenance tasks for aquariums, both scheduled and completed.';
COMMENT ON COLUMN public.maintenance.equipment_id IS 'Link to a specific piece of equipment for this maintenance task.';
COMMENT ON COLUMN public.maintenance.due_date IS 'The date the maintenance task is scheduled to be done.';
COMMENT ON COLUMN public.maintenance.completed_date IS 'The date the maintenance task was completed.';

-- Add Row Level Security (RLS)
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;

-- Create policies for users to manage their own maintenance tasks
CREATE POLICY "Users can view their own maintenance tasks"
  ON public.maintenance
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create maintenance tasks"
  ON public.maintenance
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own maintenance tasks"
  ON public.maintenance
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own maintenance tasks"
  ON public.maintenance
  FOR DELETE
  USING (auth.uid() = user_id);
