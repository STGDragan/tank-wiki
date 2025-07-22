-- Add a skipped_at column to the maintenance table
ALTER TABLE public.maintenance ADD COLUMN IF NOT EXISTS skipped_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.maintenance ADD COLUMN IF NOT EXISTS skip_reason TEXT DEFAULT NULL;