-- Enhance the maintenance notification preferences table with more granular controls
ALTER TABLE public.maintenance_notification_preferences 
ADD COLUMN IF NOT EXISTS reminder_intervals INTEGER[] DEFAULT ARRAY[7, 3, 1],
ADD COLUMN IF NOT EXISTS advance_notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS due_date_notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS overdue_notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS escalation_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS escalation_days INTEGER DEFAULT 3;