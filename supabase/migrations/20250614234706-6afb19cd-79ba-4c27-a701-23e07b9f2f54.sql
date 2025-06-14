
ALTER TABLE public.maintenance ADD COLUMN frequency TEXT;

COMMENT ON COLUMN public.maintenance.frequency IS 'How often the task should recur. e.g., "daily", "weekly", "monthly". A null or "once" value means it does not recur.';
