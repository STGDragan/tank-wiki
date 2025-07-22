-- Update the notification function to handle granular notification controls
CREATE OR REPLACE FUNCTION public.get_pending_maintenance_notifications()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  -- This function aggregates maintenance tasks for users based on their notification preferences
  SELECT jsonb_agg(user_data)
  INTO result
  FROM (
    SELECT
      u.id AS user_id,
      u.email,
      p.full_name,
      COALESCE(mnp.timezone, 'UTC') as user_timezone,
      COALESCE(mnp.notification_time, '18:00:00'::time) as preferred_time,
      COALESCE(mnp.reminder_intervals, ARRAY[7, 3, 1]) as reminder_intervals,
      (
        -- Advance notifications (tasks due in X days based on reminder intervals)
        CASE WHEN COALESCE(mnp.advance_notifications_enabled, true) = true THEN
          (SELECT jsonb_agg(tasks)
           FROM public.maintenance tasks
           WHERE tasks.user_id = u.id
           AND tasks.completed_date IS NULL
           AND tasks.due_date >= CURRENT_DATE
           AND (tasks.due_date - CURRENT_DATE) = ANY(COALESCE(mnp.reminder_intervals, ARRAY[7, 3, 1])))
        ELSE NULL
        END
      ) AS advance_tasks,
      (
        -- Due date notifications (tasks due today)
        CASE WHEN COALESCE(mnp.due_date_notifications_enabled, true) = true THEN
          (SELECT jsonb_agg(tasks)
           FROM public.maintenance tasks
           WHERE tasks.user_id = u.id
           AND tasks.completed_date IS NULL
           AND tasks.due_date = CURRENT_DATE)
        ELSE NULL
        END
      ) AS due_today_tasks,
      (
        -- Overdue notifications (tasks past due date)
        CASE WHEN COALESCE(mnp.overdue_notifications_enabled, true) = true THEN
          (SELECT jsonb_agg(tasks)
           FROM public.maintenance tasks
           WHERE tasks.user_id = u.id
           AND tasks.completed_date IS NULL
           AND tasks.due_date < CURRENT_DATE)
        ELSE NULL
        END
      ) AS overdue_tasks,
      (
        -- Escalation notifications (tasks overdue for X days)
        CASE WHEN COALESCE(mnp.escalation_enabled, false) = true THEN
          (SELECT jsonb_agg(tasks)
           FROM public.maintenance tasks
           WHERE tasks.user_id = u.id
           AND tasks.completed_date IS NULL
           AND tasks.due_date < CURRENT_DATE - INTERVAL '1 day' * COALESCE(mnp.escalation_days, 3))
        ELSE NULL
        END
      ) AS escalation_tasks
    FROM auth.users u
    JOIN public.profiles p ON u.id = p.id
    LEFT JOIN public.maintenance_notification_preferences mnp ON u.id = mnp.user_id
    -- Only include users who have notifications enabled and tasks to notify about
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
      -- Check if user has any tasks that match their notification preferences
      EXISTS (
        SELECT 1 FROM public.maintenance m
        WHERE m.user_id = u.id
        AND m.completed_date IS NULL
        AND (
          -- Advance notifications
          (COALESCE(mnp.advance_notifications_enabled, true) = true AND 
           m.due_date >= CURRENT_DATE AND 
           (m.due_date - CURRENT_DATE) = ANY(COALESCE(mnp.reminder_intervals, ARRAY[7, 3, 1]))) OR
          -- Due today notifications
          (COALESCE(mnp.due_date_notifications_enabled, true) = true AND 
           m.due_date = CURRENT_DATE) OR
          -- Overdue notifications
          (COALESCE(mnp.overdue_notifications_enabled, true) = true AND 
           m.due_date < CURRENT_DATE) OR
          -- Escalation notifications
          (COALESCE(mnp.escalation_enabled, false) = true AND 
           m.due_date < CURRENT_DATE - INTERVAL '1 day' * COALESCE(mnp.escalation_days, 3))
        )
      )
  ) AS user_data
  WHERE 
    user_data.advance_tasks IS NOT NULL OR 
    user_data.due_today_tasks IS NOT NULL OR 
    user_data.overdue_tasks IS NOT NULL OR 
    user_data.escalation_tasks IS NOT NULL;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$function$;