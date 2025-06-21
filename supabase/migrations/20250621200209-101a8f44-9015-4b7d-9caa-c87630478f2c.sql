
-- Create tank types enum
CREATE TYPE public.tank_type AS ENUM (
  'freshwater_community',
  'african_cichlid', 
  'planted_low_tech',
  'planted_high_tech',
  'brackish',
  'freshwater_nano',
  'saltwater_fo',
  'fowlr',
  'reef_soft_coral',
  'reef_lps',
  'reef_sps',
  'reef_mixed'
);

-- Create size class enum
CREATE TYPE public.size_class AS ENUM (
  'nano',
  'small', 
  'medium',
  'large',
  'giant'
);

-- Create temperament enum
CREATE TYPE public.temperament AS ENUM (
  'peaceful',
  'semi_aggressive',
  'aggressive'
);

-- Create difficulty enum
CREATE TYPE public.difficulty_level AS ENUM (
  'beginner',
  'intermediate',
  'expert'
);

-- Create hierarchical categories table
CREATE TABLE public.product_categories_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.product_categories_new(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create compatibility tags table
CREATE TABLE public.compatibility_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  tag_type TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product compatibility tags junction table
CREATE TABLE public.product_compatibility_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  compatibility_tag_id UUID REFERENCES public.compatibility_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, compatibility_tag_id)
);

-- Add new columns to products table for enhanced categorization
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.product_categories_new(id),
ADD COLUMN IF NOT EXISTS size_class public.size_class,
ADD COLUMN IF NOT EXISTS temperament public.temperament,
ADD COLUMN IF NOT EXISTS difficulty_level public.difficulty_level,
ADD COLUMN IF NOT EXISTS tank_types public.tank_type[],
ADD COLUMN IF NOT EXISTS is_livestock BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS care_level TEXT,
ADD COLUMN IF NOT EXISTS max_size TEXT,
ADD COLUMN IF NOT EXISTS min_tank_size TEXT,
ADD COLUMN IF NOT EXISTS water_params JSONB;

-- Insert hierarchical categories
INSERT INTO public.product_categories_new (name, slug, description, parent_id, display_order) VALUES
-- Main categories
('Aquarium Equipment', 'aquarium-equipment', 'All equipment for aquarium setup and maintenance', NULL, 1),
('Consumables', 'consumables', 'Fish food, treatments, and supplements', NULL, 2),
('Livestock', 'livestock', 'Fish, invertebrates, corals, and plants', NULL, 3);

-- Get category IDs for subcategories
WITH category_ids AS (
  SELECT id, slug FROM public.product_categories_new WHERE parent_id IS NULL
)
INSERT INTO public.product_categories_new (name, slug, description, parent_id, display_order)
SELECT 
  subcategory.name,
  subcategory.slug,
  subcategory.description,
  category_ids.id,
  subcategory.display_order
FROM (
  VALUES
  -- Aquarium Equipment subcategories
  ('Filtration', 'filtration', 'Filters and filter media', 'aquarium-equipment', 1),
  ('Lighting', 'lighting', 'Aquarium lighting systems', 'aquarium-equipment', 2),
  ('Heating & Cooling', 'heating-cooling', 'Temperature control equipment', 'aquarium-equipment', 3),
  ('Pumps & Flow', 'pumps-flow', 'Water movement equipment', 'aquarium-equipment', 4),
  ('CO2 & Fertilization', 'co2-fertilization', 'Plant care systems', 'aquarium-equipment', 5),
  ('Testing & Maintenance', 'testing-maintenance', 'Water testing and cleaning tools', 'aquarium-equipment', 6),
  
  -- Consumables subcategories
  ('Fish Food', 'fish-food', 'Nutrition for all fish types', 'consumables', 1),
  ('Coral Food', 'coral-food', 'Specialized coral nutrition', 'consumables', 2),
  ('Plant Fertilizers', 'plant-fertilizers', 'Aquatic plant nutrients', 'consumables', 3),
  ('Reef Supplements', 'reef-supplements', 'Reef tank additives', 'consumables', 4),
  ('Water Treatment', 'water-treatment', 'Water conditioners and treatments', 'consumables', 5),
  
  -- Livestock subcategories
  ('Freshwater Fish', 'freshwater-fish', 'Tropical and coldwater fish', 'livestock', 1),
  ('Freshwater Invertebrates', 'freshwater-invertebrates', 'Shrimp, snails, and crabs', 'livestock', 2),
  ('Freshwater Plants', 'freshwater-plants', 'Aquatic plants for freshwater tanks', 'livestock', 3),
  ('Saltwater Fish', 'saltwater-fish', 'Marine fish species', 'livestock', 4),
  ('Saltwater Invertebrates', 'saltwater-invertebrates', 'Marine invertebrates', 'livestock', 5),
  ('Corals', 'corals', 'Soft and hard corals', 'livestock', 6)
) AS subcategory(name, slug, description, parent_slug, display_order)
JOIN category_ids ON category_ids.slug = subcategory.parent_slug;

-- Insert detailed subcategories for Filtration
WITH filtration_id AS (
  SELECT id FROM public.product_categories_new WHERE slug = 'filtration'
)
INSERT INTO public.product_categories_new (name, slug, description, parent_id, display_order)
SELECT 
  detail.name,
  detail.slug,
  detail.description,
  filtration_id.id,
  detail.display_order
FROM (
  VALUES
  ('HOB Filters', 'hob-filters', 'Hang-on-back filters', 1),
  ('Canister Filters', 'canister-filters', 'External canister filtration', 2),
  ('Sump Filters', 'sump-filters', 'Sump filtration systems', 3),
  ('Internal Filters', 'internal-filters', 'Submersible internal filters', 4),
  ('Filter Media', 'filter-media', 'Carbon, biomedia, sponges, filter floss', 5)
) AS detail(name, slug, description, display_order), filtration_id;

-- Insert detailed subcategories for Lighting
WITH lighting_id AS (
  SELECT id FROM public.product_categories_new WHERE slug = 'lighting'
)
INSERT INTO public.product_categories_new (name, slug, description, parent_id, display_order)
SELECT 
  detail.name,
  detail.slug,
  detail.description,
  lighting_id.id,
  detail.display_order
FROM (
  VALUES
  ('Freshwater Lights', 'freshwater-lights', 'Basic freshwater aquarium lighting', 1),
  ('Planted Tank Lights', 'planted-tank-lights', 'High-intensity plant growth lighting', 2),
  ('Reef Lights', 'reef-lights', 'Coral growth and color enhancement lighting', 3)
) AS detail(name, slug, description, display_order), lighting_id;

-- Insert compatibility tags
INSERT INTO public.compatibility_tags (name, description, tag_type) VALUES
('Reef Safe', 'Safe for reef aquariums with corals', 'safety'),
('Compatible with Shrimp', 'Will not harm dwarf shrimp', 'compatibility'),
('Schooling', 'Requires group of 6 or more', 'behavior'),
('Predatory', 'May eat smaller tank mates', 'behavior'),
('Requires Group', 'Needs to be kept in groups', 'social'),
('Peaceful Community', 'Good for community tanks', 'temperament'),
('Plant Safe', 'Will not damage live plants', 'compatibility'),
('Invertebrate Safe', 'Safe with invertebrates', 'compatibility'),
('Beginner Friendly', 'Good for new aquarists', 'difficulty'),
('Nano Tank Suitable', 'Suitable for tanks under 20 gallons', 'size'),
('Requires Large Tank', 'Needs 75+ gallon tank', 'size'),
('Nocturnal', 'Most active at night', 'behavior'),
('Territorial', 'Can be territorial with similar species', 'behavior'),
('Jumper', 'Prone to jumping out of tank', 'behavior'),
('Sensitive to Water Quality', 'Requires stable water parameters', 'care');

-- Enable RLS on new tables
ALTER TABLE public.product_categories_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compatibility_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_compatibility_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Allow public read access to categories" ON public.product_categories_new
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access to compatibility tags" ON public.compatibility_tags
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access to product compatibility tags" ON public.product_compatibility_tags
  FOR SELECT TO public USING (true);

-- Admin policies for categories
CREATE POLICY "Allow admin full access to categories" ON public.product_categories_new
  FOR ALL TO authenticated 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin policies for compatibility tags
CREATE POLICY "Allow admin full access to compatibility tags" ON public.compatibility_tags
  FOR ALL TO authenticated 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin full access to product compatibility tags" ON public.product_compatibility_tags
  FOR ALL TO authenticated 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Create indexes for performance
CREATE INDEX idx_product_categories_parent_id ON public.product_categories_new(parent_id);
CREATE INDEX idx_product_categories_slug ON public.product_categories_new(slug);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_tank_types ON public.products USING GIN (tank_types);
CREATE INDEX idx_products_size_class ON public.products(size_class);
CREATE INDEX idx_products_temperament ON public.products(temperament);
CREATE INDEX idx_products_difficulty_level ON public.products(difficulty_level);
CREATE INDEX idx_product_compatibility_tags_product_id ON public.product_compatibility_tags(product_id);

-- Create function to get category hierarchy
CREATE OR REPLACE FUNCTION public.get_category_hierarchy()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  parent_id UUID,
  level INTEGER,
  path TEXT[]
) 
LANGUAGE sql
STABLE
AS $$
  WITH RECURSIVE category_tree AS (
    -- Base case: root categories
    SELECT 
      c.id,
      c.name,
      c.slug,
      c.description,
      c.parent_id,
      0 as level,
      ARRAY[c.name] as path
    FROM public.product_categories_new c
    WHERE c.parent_id IS NULL AND c.is_active = true
    
    UNION ALL
    
    -- Recursive case: child categories
    SELECT 
      c.id,
      c.name,
      c.slug,
      c.description,
      c.parent_id,
      ct.level + 1,
      ct.path || c.name
    FROM public.product_categories_new c
    JOIN category_tree ct ON c.parent_id = ct.id
    WHERE c.is_active = true
  )
  SELECT * FROM category_tree
  ORDER BY level, name;
$$;

-- Update existing products table with triggers
CREATE OR REPLACE FUNCTION public.update_product_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_updated_at();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.product_categories_new
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_updated_at();
