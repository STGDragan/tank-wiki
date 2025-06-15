
-- Create product_categories table
CREATE TABLE public.product_categories (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for product_categories
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Allow all users to read categories (for product forms)
CREATE POLICY "Allow all users to read product categories" ON public.product_categories FOR SELECT USING (true);

-- Allow admin users to manage categories
CREATE POLICY "Allow admin to insert product categories" ON public.product_categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Allow admin to update product categories" ON public.product_categories FOR UPDATE USING (public.is_admin());
CREATE POLICY "Allow admin to delete product categories" ON public.product_categories FOR DELETE USING (public.is_admin());


-- Create product_subcategories table
CREATE TABLE public.product_subcategories (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    category_id uuid NOT NULL REFERENCES public.product_categories(id) ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for product_subcategories
ALTER TABLE public.product_subcategories ENABLE ROW LEVEL SECURITY;

-- Allow all users to read subcategories (for product forms)
CREATE POLICY "Allow all users to read product subcategories" ON public.product_subcategories FOR SELECT USING (true);

-- Allow admin users to manage subcategories
CREATE POLICY "Allow admin to insert product subcategories" ON public.product_subcategories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Allow admin to update product subcategories" ON public.product_subcategories FOR UPDATE USING (public.is_admin());
CREATE POLICY "Allow admin to delete product subcategories" ON public.product_subcategories FOR DELETE USING (public.is_admin());

-- Populate product_categories
INSERT INTO public.product_categories (name) VALUES
('Equipment'),
('Livestock'),
('Food'),
('Consumables');

-- Populate product_subcategories
WITH cats AS (
  SELECT id, name FROM public.product_categories
)
INSERT INTO public.product_subcategories (name, category_id) VALUES
('Filter', (SELECT id FROM cats WHERE name = 'Equipment')),
('Heater', (SELECT id FROM cats WHERE name = 'Equipment')),
('Lighting', (SELECT id FROM cats WHERE name = 'Equipment')),
('Pump', (SELECT id FROM cats WHERE name = 'Equipment')),
('Tank', (SELECT id FROM cats WHERE name = 'Equipment')),
('Other', (SELECT id FROM cats WHERE name = 'Equipment')),
('Freshwater Fish', (SELECT id FROM cats WHERE name = 'Livestock')),
('Saltwater Fish', (SELECT id FROM cats WHERE name = 'Livestock')),
('Invertebrate', (SELECT id FROM cats WHERE name = 'Livestock')),
('Coral', (SELECT id FROM cats WHERE name = 'Livestock')),
('Plant', (SELECT id FROM cats WHERE name = 'Livestock')),
('Flakes', (SELECT id FROM cats WHERE name = 'Food')),
('Pellets', (SELECT id FROM cats WHERE name = 'Food')),
('Frozen', (SELECT id FROM cats WHERE name = 'Food')),
('Live', (SELECT id FROM cats WHERE name = 'Food')),
('Other', (SELECT id FROM cats WHERE name = 'Food')),
('Water Treatment', (SELECT id FROM cats WHERE name = 'Consumables')),
('Test Kits', (SELECT id FROM cats WHERE name = 'Consumables')),
('Substrate', (SELECT id FROM cats WHERE name = 'Consumables')),
('Fertilizer', (SELECT id FROM cats WHERE name = 'Consumables')),
('Other', (SELECT id FROM cats WHERE name = 'Consumables'));
