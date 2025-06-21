
-- Enable Row Level Security on the tags table
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Create policies for the tags table
-- Allow everyone to view tags (they're generally public reference data)
CREATE POLICY "Anyone can view tags" ON public.tags
  FOR SELECT USING (true);

-- Only admins can manage tags
CREATE POLICY "Admins can manage tags" ON public.tags
  FOR ALL USING (public.is_admin());

-- Enable Row Level Security on the product_tags table
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for the product_tags table
-- Allow everyone to view product tags (they're part of public product data)
CREATE POLICY "Anyone can view product tags" ON public.product_tags
  FOR SELECT USING (true);

-- Only admins can manage product tags
CREATE POLICY "Admins can manage product tags" ON public.product_tags
  FOR ALL USING (public.is_admin());
