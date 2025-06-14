
-- Add Row Level Security (RLS) to the equipment table
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own equipment
CREATE POLICY "Users can view their own equipment"
  ON public.equipment
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own equipment
CREATE POLICY "Users can create their own equipment"
  ON public.equipment
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own equipment
CREATE POLICY "Users can update their own equipment"
  ON public.equipment
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own equipment
CREATE POLICY "Users can delete their own equipment"
  ON public.equipment
  FOR DELETE
  USING (auth.uid() = user_id);
