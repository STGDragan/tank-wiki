
-- Create a junction table to support multiple categories per product
CREATE TABLE public.product_category_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.product_categories_new(id) ON DELETE CASCADE,
  subcategory_name TEXT, -- Allow custom subcategories
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, category_id, subcategory_name)
);

-- Enable RLS on the new table
ALTER TABLE public.product_category_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for product category assignments
CREATE POLICY "Allow public read access to product category assignments" 
  ON public.product_category_assignments
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin full access to product category assignments" 
  ON public.product_category_assignments
  FOR ALL TO authenticated 
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create index for better performance
CREATE INDEX idx_product_category_assignments_product_id ON public.product_category_assignments(product_id);
CREATE INDEX idx_product_category_assignments_category_id ON public.product_category_assignments(category_id);

-- Add a table for predefined subcategories to populate the dropdown
CREATE TABLE public.predefined_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES public.product_categories_new(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on predefined subcategories
ALTER TABLE public.predefined_subcategories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for predefined subcategories
CREATE POLICY "Allow public read access to predefined subcategories" 
  ON public.predefined_subcategories
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin full access to predefined subcategories" 
  ON public.predefined_subcategories
  FOR ALL TO authenticated 
  USING (is_admin())
  WITH CHECK (is_admin());

-- Insert some predefined subcategories based on the existing hierarchy
INSERT INTO public.predefined_subcategories (name, category_id) 
SELECT 'Testing & Maintenance', id FROM public.product_categories_new WHERE slug = 'aquarium-equipment';

INSERT INTO public.predefined_subcategories (name, category_id) 
SELECT 'CO2 Equipment', id FROM public.product_categories_new WHERE slug = 'aquarium-equipment';

INSERT INTO public.predefined_subcategories (name, category_id) 
SELECT 'UV Sterilizers', id FROM public.product_categories_new WHERE slug = 'aquarium-equipment';

INSERT INTO public.predefined_subcategories (name, category_id) 
SELECT 'Protein Skimmers', id FROM public.product_categories_new WHERE slug = 'aquarium-equipment';

INSERT INTO public.predefined_subcategories (name, category_id) 
SELECT 'Aquarium Controllers', id FROM public.product_categories_new WHERE slug = 'aquarium-equipment';

-- Add subcategories for other main categories
INSERT INTO public.predefined_subcategories (name, category_id) 
SELECT 'Dry Food', id FROM public.product_categories_new WHERE slug = 'consumables';

INSERT INTO public.predefined_subcategories (name, category_id) 
SELECT 'Frozen Food', id FROM public.product_categories_new WHERE slug = 'consumables';

INSERT INTO public.predefined_subcategories (name, category_id) 
SELECT 'Live Food', id FROM public.product_categories_new WHERE slug = 'consumables';

INSERT INTO public.predefined_subcategories (name, category_id) 
SELECT 'Supplements', id FROM public.product_categories_new WHERE slug = 'consumables';
