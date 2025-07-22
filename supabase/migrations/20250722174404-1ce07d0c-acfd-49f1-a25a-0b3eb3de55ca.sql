-- Create default maintenance templates for common tasks that don't require specific equipment
INSERT INTO public.maintenance_templates (
    template_name,
    equipment_type,
    task_description,
    frequency_days,
    estimated_cost,
    priority,
    instructions,
    is_active
) VALUES 
-- General aquarium maintenance tasks
('Weekly Water Change', 'general', 'Perform 20-25% water change', 7, 5.00, 'high', 'Remove 20-25% of tank water and replace with dechlorinated water at matching temperature. Test water parameters before and after.', true),
('Glass Cleaning', 'general', 'Clean algae and spots from glass surfaces', 7, 2.00, 'medium', 'Use aquarium-safe glass cleaner or algae scraper. Clean both inside and outside surfaces. Avoid soap or chemicals.', true),
('Substrate Vacuuming', 'general', 'Vacuum gravel/substrate to remove debris', 14, 3.00, 'medium', 'Use aquarium vacuum to clean substrate during water changes. Focus on areas with visible debris or uneaten food.', true),
('Filter Media Inspection', 'general', 'Check and clean filter media as needed', 14, 8.00, 'high', 'Rinse mechanical filter media in tank water. Replace chemical media monthly. Never replace all media at once.', true),
('Water Parameter Testing', 'general', 'Test pH, ammonia, nitrite, and nitrate levels', 7, 4.00, 'high', 'Use test strips or liquid test kits. Record results and watch for trends. Take action if parameters are outside safe ranges.', true),
('Equipment Inspection', 'general', 'Check all equipment for proper operation', 30, 0.00, 'medium', 'Verify heaters, pumps, lights, and other equipment are functioning correctly. Look for unusual sounds, temperatures, or wear.', true),
('Plant Trimming and Maintenance', 'general', 'Trim and maintain live plants', 14, 2.00, 'low', 'Remove dead/dying leaves, trim overgrown plants, and check for signs of nutrient deficiencies or pest issues.', true),
('Feeding Schedule Review', 'general', 'Review and adjust feeding amounts', 30, 0.00, 'low', 'Observe fish behavior and adjust feeding amounts. Remove any uneaten food within 2-3 minutes of feeding.', true);

-- Create function to set up default maintenance schedule for pro users
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
            SELECT 1 FROM profiles 
            WHERE id = p_user_id 
            AND admin_subscription_override = true
        ) OR
        has_admin_granted_subscription(p_user_id)
    ) THEN
        RAISE EXCEPTION 'User does not have active pro subscription';
    END IF;

    -- Check if user already has default tasks set up for this aquarium
    SELECT COUNT(*) INTO existing_task_count
    FROM maintenance m
    JOIN maintenance_templates mt ON m.template_id = mt.id
    WHERE m.user_id = p_user_id 
    AND m.aquarium_id = p_aquarium_id
    AND mt.equipment_type = 'general'
    AND m.maintenance_category = 'default_schedule';

    -- Only set up defaults if none exist
    IF existing_task_count = 0 THEN
        -- Create default maintenance tasks for all general templates
        FOR template_record IN 
            SELECT * FROM maintenance_templates 
            WHERE equipment_type = 'general' AND is_active = true
        LOOP
            INSERT INTO maintenance (
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