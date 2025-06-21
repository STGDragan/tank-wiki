
-- Create a table to define wizard guide areas/contexts
CREATE TABLE public.wizard_guide_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  area_key TEXT NOT NULL UNIQUE,
  area_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert predefined wizard guide areas based on the setup steps
INSERT INTO public.wizard_guide_areas (area_key, area_name, description) VALUES
  ('tank_placement', 'Tank Placement Guide', 'Guides for optimal aquarium placement and location setup'),
  ('equipment_installation', 'Equipment Installation', 'Guides for installing filters, heaters, and other equipment'),
  ('substrate_selection', 'Substrate Selection Guide', 'Guides for choosing and adding substrate materials'),
  ('aquascaping_basics', 'Aquascaping Basics', 'Guides for decorating and arranging aquarium elements'),
  ('water_preparation', 'Water Preparation', 'Guides for preparing and conditioning aquarium water'),
  ('initial_startup', 'Initial Startup', 'Guides for starting up equipment and systems'),
  ('nitrogen_cycle', 'Nitrogen Cycle Guide', 'Comprehensive guides for the cycling process'),
  ('daily_maintenance', 'Daily Tank Maintenance', 'Guides for routine aquarium care'),
  ('water_testing', 'Water Testing Schedule', 'Guides for testing and monitoring water parameters'),
  ('equipment_troubleshooting', 'Equipment Troubleshooting', 'Guides for fixing common equipment issues'),
  ('fish_health', 'Fish Health Monitoring', 'Guides for maintaining fish health and detecting issues'),
  ('algae_prevention', 'Algae Prevention', 'Guides for preventing and managing algae growth');

-- Create a junction table to link articles to wizard guide areas
CREATE TABLE public.article_wizard_guides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.knowledge_articles(id) ON DELETE CASCADE,
  guide_area_id UUID NOT NULL REFERENCES public.wizard_guide_areas(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(article_id, guide_area_id)
);

-- Add trigger to automatically update the updated_at column
CREATE TRIGGER update_article_wizard_guides_updated_at
  BEFORE UPDATE ON public.article_wizard_guides
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.wizard_guide_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_wizard_guides ENABLE ROW LEVEL SECURITY;

-- Create policies for wizard guide areas (readable by everyone, manageable by admins)
CREATE POLICY "Anyone can view wizard guide areas" 
  ON public.wizard_guide_areas 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage wizard guide areas" 
  ON public.wizard_guide_areas 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Create policies for article wizard guides (readable by everyone, manageable by admins)
CREATE POLICY "Anyone can view article wizard guides" 
  ON public.article_wizard_guides 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage article wizard guides" 
  ON public.article_wizard_guides 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));
