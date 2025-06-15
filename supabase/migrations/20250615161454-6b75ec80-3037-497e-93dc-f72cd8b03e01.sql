
CREATE OR REPLACE FUNCTION public.get_pending_maintenance_notifications()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- This function aggregates upcoming and overdue maintenance tasks for each user.
  -- It joins with auth.users to get email addresses for notifications.
  -- The SECURITY DEFINER clause allows it to bypass RLS to fetch all necessary data.
  SELECT jsonb_agg(user_data)
  INTO result
  FROM (
    SELECT
      u.id AS user_id,
      u.email,
      p.full_name,
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
    -- Only include users who have upcoming or overdue tasks.
    WHERE
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
$$;
