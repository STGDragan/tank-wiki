-- Fix security issues for functions and missing RLS

-- Update function to use proper search path
CREATE OR REPLACE FUNCTION public.generate_maintenance_from_template(
  p_equipment_id UUID,
  p_template_id UUID,
  p_user_id UUID,
  p_aquarium_id UUID
) RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  template_record public.maintenance_templates%ROWTYPE;
  new_task_id UUID;
BEGIN
  -- Get template details
  SELECT * INTO template_record FROM public.maintenance_templates WHERE id = p_template_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found';
  END IF;
  
  -- Create maintenance task
  INSERT INTO public.maintenance (
    aquarium_id,
    user_id,
    equipment_id,
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
    p_equipment_id,
    p_template_id,
    template_record.task_description,
    template_record.instructions,
    CURRENT_DATE + INTERVAL '1 day' * template_record.frequency_days,
    CASE 
      WHEN template_record.frequency_days <= 7 THEN 'weekly'
      WHEN template_record.frequency_days <= 31 THEN 'monthly'
      WHEN template_record.frequency_days <= 93 THEN 'quarterly'
      WHEN template_record.frequency_days <= 186 THEN 'twice_yearly'
      ELSE 'yearly'
    END,
    template_record.estimated_cost,
    template_record.priority,
    'routine',
    'custom'
  ) RETURNING id INTO new_task_id;
  
  RETURN new_task_id;
END;
$$;

-- Enable RLS on any missing tables (these should already be enabled but making sure)
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strains ENABLE ROW LEVEL SECURITY;

-- Create policies for grades table
CREATE POLICY "Allow public read access to grades"
  ON public.grades
  FOR SELECT
  USING (true);

CREATE POLICY "Allow admin to manage grades"
  ON public.grades
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for images table
CREATE POLICY "Allow public read access to images"
  ON public.images
  FOR SELECT
  USING (true);

CREATE POLICY "Allow admin to manage images"
  ON public.images
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for strains table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'strains') THEN
    EXECUTE 'CREATE POLICY "Allow public read access to strains" ON public.strains FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Allow admin to manage strains" ON public.strains FOR ALL USING (has_role(auth.uid(), ''admin''::app_role)) WITH CHECK (has_role(auth.uid(), ''admin''::app_role))';
  END IF;
END $$;