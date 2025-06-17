
-- Add a recommended column to the products table
ALTER TABLE public.products
ADD COLUMN is_recommended BOOLEAN NOT NULL DEFAULT false;

-- Update the existing RLS policies to include the new column
-- The existing policies already cover this new column since they use FOR ALL or FOR SELECT on the entire table

-- Add an index for better performance when querying recommended products
CREATE INDEX idx_products_is_recommended ON public.products(is_recommended) WHERE is_recommended = true;
