
-- Add an is_featured column to the products table
ALTER TABLE public.products
ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false;

-- Enable Row Level Security on the products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to all products
CREATE POLICY "Products are viewable by everyone"
ON public.products FOR SELECT
USING (true);

-- Policy: Allow admins to perform any action on products
CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());
