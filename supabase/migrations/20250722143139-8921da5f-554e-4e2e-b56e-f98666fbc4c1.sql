-- Create maintenance templates table for equipment-specific maintenance schedules
CREATE TABLE public.maintenance_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_type TEXT NOT NULL,
  template_name TEXT NOT NULL,
  task_description TEXT NOT NULL,
  frequency_days INTEGER NOT NULL,
  estimated_cost NUMERIC(10,2) DEFAULT 0,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  instructions TEXT,
  required_supplies JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create maintenance notification preferences table
CREATE TABLE public.maintenance_notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  sms_number TEXT,
  reminder_intervals INTEGER[] DEFAULT ARRAY[7, 3, 1],
  escalation_enabled BOOLEAN DEFAULT false,
  escalation_days INTEGER DEFAULT 3,
  notification_time TIME DEFAULT '09:00:00',
  timezone TEXT DEFAULT 'UTC',
  task_type_preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create maintenance costs tracking table
CREATE TABLE public.maintenance_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  maintenance_id UUID NOT NULL REFERENCES public.maintenance(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  cost_amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  cost_type TEXT DEFAULT 'supplies' CHECK (cost_type IN ('supplies', 'labor', 'equipment', 'other')),
  vendor_name TEXT,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create equipment warranties table
CREATE TABLE public.equipment_warranties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  warranty_start_date DATE NOT NULL,
  warranty_end_date DATE NOT NULL,
  warranty_provider TEXT,
  warranty_terms TEXT,
  proof_of_purchase_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create maintenance suppliers table
CREATE TABLE public.maintenance_suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  supplier_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  specialties TEXT[],
  preferred_supplier BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create maintenance history analytics table
CREATE TABLE public.maintenance_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  aquarium_id UUID NOT NULL REFERENCES public.aquariums(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE SET NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('completion_rate', 'average_cost', 'overdue_count', 'efficiency_score')),
  metric_value NUMERIC(10,2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.maintenance_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for maintenance_templates
CREATE POLICY "Anyone can view maintenance templates"
  ON public.maintenance_templates
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage maintenance templates"
  ON public.maintenance_templates
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for maintenance_notification_preferences
CREATE POLICY "Users can manage their own notification preferences"
  ON public.maintenance_notification_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for maintenance_costs
CREATE POLICY "Users can manage their own maintenance costs"
  ON public.maintenance_costs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for equipment_warranties
CREATE POLICY "Users can manage their own equipment warranties"
  ON public.equipment_warranties
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for maintenance_suppliers
CREATE POLICY "Users can manage their own suppliers"
  ON public.maintenance_suppliers
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for maintenance_analytics
CREATE POLICY "Users can view their own analytics"
  ON public.maintenance_analytics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert analytics"
  ON public.maintenance_analytics
  FOR INSERT
  WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_maintenance_templates_equipment_type ON public.maintenance_templates(equipment_type);
CREATE INDEX idx_maintenance_notification_preferences_user_id ON public.maintenance_notification_preferences(user_id);
CREATE INDEX idx_maintenance_costs_maintenance_id ON public.maintenance_costs(maintenance_id);
CREATE INDEX idx_maintenance_costs_user_id ON public.maintenance_costs(user_id);
CREATE INDEX idx_equipment_warranties_equipment_id ON public.equipment_warranties(equipment_id);
CREATE INDEX idx_equipment_warranties_user_id ON public.equipment_warranties(user_id);
CREATE INDEX idx_maintenance_suppliers_user_id ON public.maintenance_suppliers(user_id);
CREATE INDEX idx_maintenance_analytics_user_id ON public.maintenance_analytics(user_id);
CREATE INDEX idx_maintenance_analytics_aquarium_id ON public.maintenance_analytics(aquarium_id);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_maintenance_templates_updated_at
  BEFORE UPDATE ON public.maintenance_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER update_maintenance_notification_preferences_updated_at
  BEFORE UPDATE ON public.maintenance_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER update_equipment_warranties_updated_at
  BEFORE UPDATE ON public.equipment_warranties
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER update_maintenance_suppliers_updated_at
  BEFORE UPDATE ON public.maintenance_suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();

-- Add columns to existing maintenance table for enhanced features
ALTER TABLE public.maintenance ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.maintenance_templates(id) ON DELETE SET NULL;
ALTER TABLE public.maintenance ADD COLUMN IF NOT EXISTS cost_estimate NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.maintenance ADD COLUMN IF NOT EXISTS actual_cost NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.maintenance ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical'));
ALTER TABLE public.maintenance ADD COLUMN IF NOT EXISTS estimated_duration INTEGER; -- minutes
ALTER TABLE public.maintenance ADD COLUMN IF NOT EXISTS actual_duration INTEGER; -- minutes
ALTER TABLE public.maintenance ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.maintenance_suppliers(id) ON DELETE SET NULL;
ALTER TABLE public.maintenance ADD COLUMN IF NOT EXISTS recurring_pattern TEXT; -- 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'
ALTER TABLE public.maintenance ADD COLUMN IF NOT EXISTS next_due_date DATE;
ALTER TABLE public.maintenance ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100);
ALTER TABLE public.maintenance ADD COLUMN IF NOT EXISTS maintenance_category TEXT DEFAULT 'routine' CHECK (maintenance_category IN ('routine', 'preventive', 'emergency', 'seasonal'));

-- Insert default maintenance templates
INSERT INTO public.maintenance_templates (equipment_type, template_name, task_description, frequency_days, estimated_cost, priority, instructions, required_supplies) VALUES
('Filter', 'Filter Cartridge Replacement', 'Replace filter cartridge to maintain water quality', 30, 15.00, 'medium', 'Turn off filter, remove old cartridge, install new one, prime filter', '["Filter cartridge", "Gloves"]'),
('Filter', 'Filter Media Cleaning', 'Clean bio media and filter pads', 14, 5.00, 'medium', 'Rinse filter media in aquarium water, do not use tap water', '["Bucket", "Aquarium water"]'),
('Light', 'LED Array Inspection', 'Check LED functionality and clean fixture', 90, 2.00, 'low', 'Inspect for dead LEDs, clean fixture with damp cloth', '["Microfiber cloth", "Distilled water"]'),
('Light', 'Light Timer Calibration', 'Verify and adjust lighting schedule', 180, 0.00, 'low', 'Check timer settings, adjust for seasonal changes', '[]'),
('Heater', 'Heater Accuracy Check', 'Verify heater temperature accuracy', 60, 1.00, 'medium', 'Use separate thermometer to verify heater accuracy', '["Digital thermometer"]'),
('UV Sterilizer', 'UV Bulb Replacement', 'Replace UV sterilizer bulb', 180, 25.00, 'high', 'Turn off UV, replace bulb, clean quartz sleeve', '["UV bulb", "Quartz sleeve cleaner"]'),
('Protein Skimmer', 'Skimmer Cup Cleaning', 'Clean protein skimmer collection cup', 7, 2.00, 'medium', 'Remove cup, clean with hot water and brush', '["Cleaning brush", "Hot water"]'),
('Powerhead', 'Impeller Maintenance', 'Clean and inspect powerhead impeller', 90, 3.00, 'medium', 'Disassemble powerhead, clean impeller and housing', '["Cleaning brush", "Replacement O-rings"]');

-- Create function to auto-generate maintenance tasks from templates
CREATE OR REPLACE FUNCTION public.generate_maintenance_from_template(
  p_equipment_id UUID,
  p_template_id UUID,
  p_user_id UUID,
  p_aquarium_id UUID
) RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;