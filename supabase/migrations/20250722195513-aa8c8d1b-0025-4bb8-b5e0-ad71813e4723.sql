-- Fix the security warnings by setting proper search paths for the functions

-- Update the get_pending_maintenance_notifications function with proper search path
CREATE OR REPLACE FUNCTION public.get_pending_maintenance_notifications()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Update the create_default_notification_preferences function with proper search path
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

-- Create the trigger for new user profiles
DROP TRIGGER IF EXISTS create_notification_preferences_on_profile_insert ON public.profiles;
CREATE TRIGGER create_notification_preferences_on_profile_insert
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.create_default_notification_preferences();