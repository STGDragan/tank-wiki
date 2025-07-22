-- Fix function search path for new function
CREATE OR REPLACE FUNCTION public.setup_default_maintenance_schedule(
    p_user_id UUID,
    p_aquarium_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    template_record RECORD;
    existing_task_count INTEGER;
BEGIN
    -- Only proceed if user has active subscription or admin granted subscription
    IF NOT (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = p_user_id 
            AND admin_subscription_override = true
        ) OR
        public.has_admin_granted_subscription(p_user_id)
    ) THEN
        RAISE EXCEPTION 'User does not have active pro subscription';
    END IF;

    -- Check if user already has default tasks set up for this aquarium
    SELECT COUNT(*) INTO existing_task_count
    FROM public.maintenance m
    JOIN public.maintenance_templates mt ON m.template_id = mt.id
    WHERE m.user_id = p_user_id 
    AND m.aquarium_id = p_aquarium_id
    AND mt.equipment_type = 'general'
    AND m.maintenance_category = 'default_schedule';

    -- Only set up defaults if none exist
    IF existing_task_count = 0 THEN
        -- Create default maintenance tasks for all general templates
        FOR template_record IN 
            SELECT * FROM public.maintenance_templates 
            WHERE equipment_type = 'general' AND is_active = true
        LOOP
            INSERT INTO public.maintenance (
                aquarium_id,
                user_id,
                template_id,
                task,
                notes,
                due_date,
                frequency,
                cost_estimate,
                priority,
                maintenance_category,
                recurring_pattern
            ) VALUES (
                p_aquarium_id,
                p_user_id,
                template_record.id,
                template_record.task_description,
                template_record.instructions,
                CURRENT_DATE + INTERVAL '1 day' * template_record.frequency_days,
                CASE 
                    WHEN template_record.frequency_days <= 7 THEN 'weekly'
                    WHEN template_record.frequency_days <= 31 THEN 'monthly'
                    WHEN template_record.frequency_days <= 93 THEN 'quarterly'
                    ELSE 'yearly'
                END,
                template_record.estimated_cost,
                template_record.priority,
                'default_schedule',
                'recurring'
            );
        END LOOP;
    END IF;
END;
$$;