
-- Create a table for aquarium timeline entries
CREATE TABLE public.aquarium_timeline (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aquarium_id uuid NOT NULL REFERENCES public.aquariums(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  image_url text,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.aquarium_timeline ENABLE ROW LEVEL SECURITY;

-- Create policies for timeline entries
CREATE POLICY "Users can view timeline entries for aquariums they own or have access to"
  ON public.aquarium_timeline
  FOR SELECT
  USING (
    user_id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM public.aquariums a 
      WHERE a.id = aquarium_id AND a.user_id = auth.uid()
    )
    OR
    public.check_aquarium_permission(aquarium_id, 'viewer'::public.permission_level)
  );

CREATE POLICY "Users can create timeline entries for aquariums they own or have editor access to"
  ON public.aquarium_timeline
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      EXISTS (
        SELECT 1 FROM public.aquariums a 
        WHERE a.id = aquarium_id AND a.user_id = auth.uid()
      )
      OR
      public.check_aquarium_permission(aquarium_id, 'editor'::public.permission_level)
    )
  );

CREATE POLICY "Users can update their own timeline entries"
  ON public.aquarium_timeline
  FOR UPDATE
  USING (
    user_id = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM public.aquariums a 
        WHERE a.id = aquarium_id AND a.user_id = auth.uid()
      )
      OR
      public.check_aquarium_permission(aquarium_id, 'editor'::public.permission_level)
    )
  );

CREATE POLICY "Users can delete their own timeline entries"
  ON public.aquarium_timeline
  FOR DELETE
  USING (
    user_id = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM public.aquariums a 
        WHERE a.id = aquarium_id AND a.user_id = auth.uid()
      )
      OR
      public.check_aquarium_permission(aquarium_id, 'editor'::public.permission_level)
    )
  );

-- Create trigger for updating the updated_at timestamp
CREATE TRIGGER update_aquarium_timeline_updated_at
  BEFORE UPDATE ON public.aquarium_timeline
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();
