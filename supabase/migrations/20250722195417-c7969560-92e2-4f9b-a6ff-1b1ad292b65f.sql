-- Update the maintenance notification system to support timezone-aware scheduling
-- Remove the old cron job that runs at 5 AM UTC
SELECT cron.unschedule('daily-maintenance-check');

-- Update the notification preferences table to include notification time and timezone
ALTER TABLE public.maintenance_notification_preferences 
ADD COLUMN IF NOT EXISTS notification_time TIME DEFAULT '18:00:00',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Update the get_pending_maintenance_notifications function to be timezone-aware
CREATE OR REPLACE FUNCTION public.get_pending_maintenance_notifications()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  -- This function aggregates upcoming and overdue maintenance tasks for each user.
  -- It joins with auth.users to get email addresses for notifications.
  -- Now includes timezone awareness for proper scheduling.
  SELECT jsonb_agg(user_data)
  INTO result
  FROM (
    SELECT
      u.id AS user_id,
      u.email,
      p.full_name,
      COALESCE(mnp.timezone, 'UTC') as user_timezone,
      COALESCE(mnp.notification_time, '18:00:00'::time) as preferred_time,
      (
        SELECT jsonb_agg(tasks)
        FROM public.maintenance tasks
        WHERE tasks.user_id = u.id
        AND tasks.completed_date IS NULL
        AND tasks.due_date >= CURRENT_DATE
        AND tasks.due_date <= CURRENT_DATE + interval '7 days'
      ) AS upcoming_tasks,
      (
        SELECT jsonb_agg(tasks)
        FROM public.maintenance tasks
        WHERE tasks.user_id = u.id
        AND tasks.completed_date IS NULL
        AND tasks.due_date < CURRENT_DATE
      ) AS overdue_tasks
    FROM auth.users u
    JOIN public.profiles p ON u.id = p.id
    LEFT JOIN public.maintenance_notification_preferences mnp ON u.id = mnp.user_id
    -- Only include users who have upcoming or overdue tasks and have notifications enabled
    WHERE
      COALESCE(p.enable_maintenance_notifications, true) = true AND
      COALESCE(mnp.email_enabled, true) = true AND
      -- Check if it's currently within 30 minutes of their preferred notification time
      EXTRACT(HOUR FROM (NOW() AT TIME ZONE COALESCE(mnp.timezone, 'UTC'))) = 
      EXTRACT(HOUR FROM COALESCE(mnp.notification_time, '18:00:00'::time)) AND
      EXTRACT(MINUTE FROM (NOW() AT TIME ZONE COALESCE(mnp.timezone, 'UTC'))) >= 
      EXTRACT(MINUTE FROM COALESCE(mnp.notification_time, '18:00:00'::time)) AND
      EXTRACT(MINUTE FROM (NOW() AT TIME ZONE COALESCE(mnp.timezone, 'UTC'))) < 
      EXTRACT(MINUTE FROM COALESCE(mnp.notification_time, '18:00:00'::time)) + 30 AND
      EXISTS (
        SELECT 1 FROM public.maintenance m
        WHERE m.user_id = u.id
        AND m.completed_date IS NULL
        AND (
          (m.due_date >= CURRENT_DATE AND m.due_date <= CURRENT_DATE + interval '7 days')
          OR
          m.due_date < CURRENT_DATE
        )
      )
  ) AS user_data;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$function$;

-- Create a new cron job that runs every 30 minutes
-- This will check if any users need notifications at their preferred time
SELECT cron.schedule(
  'timezone-aware-maintenance-check',
  '*/30 * * * *', -- every 30 minutes
  $$
  select
    net.http_post(
        url:='https://zlkefvmjdlqewcreqhko.supabase.co/functions/v1/maintenance-reminder',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsa2Vmdm1qZGxxZXdjcmVxaGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTI2ODcsImV4cCI6MjA2NTQ4ODY4N30.MJe_4Gvtpj2x1J5TcLorVXzyNFrMxjLvh0mBLXdhNT8"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Insert default notification preferences for existing users who don't have them
INSERT INTO public.maintenance_notification_preferences (user_id, email_enabled, notification_time, timezone)
SELECT 
  p.id,
  p.enable_maintenance_notifications,
  '18:00:00'::time,
  'UTC'
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.maintenance_notification_preferences mnp 
  WHERE mnp.user_id = p.id
);

-- Create a function to automatically create notification preferences for new users
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.maintenance_notification_preferences (
    user_id, 
    email_enabled, 
    notification_time, 
    timezone
  ) VALUES (
    NEW.id, 
    COALESCE(NEW.enable_maintenance_notifications, true),
    '18:00:00'::time,
    'UTC'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;