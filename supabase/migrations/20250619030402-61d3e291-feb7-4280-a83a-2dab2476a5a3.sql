
-- Clean up and fix the products table structure
-- Remove duplicate/unnecessary columns
ALTER TABLE public.products DROP COLUMN IF EXISTS onSale;
ALTER TABLE public.products DROP COLUMN IF EXISTS price;

-- Ensure RLS policies are properly set up for products table
DROP POLICY IF EXISTS "Anyone can view visible products" ON public.products;
CREATE POLICY "Anyone can view visible products" ON public.products
  FOR SELECT USING (visible = true);

DROP POLICY IF EXISTS "Admin can manage products" ON public.products;
CREATE POLICY "Admin can manage products" ON public.products
  FOR ALL USING (public.is_admin());

-- Fix affiliate_links foreign key constraint
ALTER TABLE public.affiliate_links 
DROP CONSTRAINT IF EXISTS affiliate_links_product_id_fkey;

ALTER TABLE public.affiliate_links 
ADD CONSTRAINT affiliate_links_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Ensure RLS policies for affiliate_links
DROP POLICY IF EXISTS "Anyone can view affiliate links" ON public.affiliate_links;
CREATE POLICY "Anyone can view affiliate links" ON public.affiliate_links
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage affiliate links" ON public.affiliate_links;
CREATE POLICY "Admin can manage affiliate links" ON public.affiliate_links
  FOR ALL USING (public.is_admin());

-- Fix any RLS issues with other tables that might be causing errors
-- Ensure aquariums table has proper RLS
ALTER TABLE public.aquariums ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own aquariums" ON public.aquariums;
CREATE POLICY "Users can view their own aquariums" ON public.aquariums
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own aquariums" ON public.aquariums;
CREATE POLICY "Users can create their own aquariums" ON public.aquariums
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own aquariums" ON public.aquariums;
CREATE POLICY "Users can update their own aquariums" ON public.aquariums
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own aquariums" ON public.aquariums;
CREATE POLICY "Users can delete their own aquariums" ON public.aquariums
  FOR DELETE USING (auth.uid() = user_id);

-- Ensure livestock table has proper RLS
ALTER TABLE public.livestock ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own livestock" ON public.livestock;
CREATE POLICY "Users can view their own livestock" ON public.livestock
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own livestock" ON public.livestock;
CREATE POLICY "Users can create their own livestock" ON public.livestock
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own livestock" ON public.livestock;
CREATE POLICY "Users can update their own livestock" ON public.livestock
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own livestock" ON public.livestock;
CREATE POLICY "Users can delete their own livestock" ON public.livestock
  FOR DELETE USING (auth.uid() = user_id);

-- Ensure equipment table has proper RLS
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own equipment" ON public.equipment;
CREATE POLICY "Users can view their own equipment" ON public.equipment
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own equipment" ON public.equipment;
CREATE POLICY "Users can create their own equipment" ON public.equipment
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own equipment" ON public.equipment;
CREATE POLICY "Users can update their own equipment" ON public.equipment
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own equipment" ON public.equipment;
CREATE POLICY "Users can delete their own equipment" ON public.equipment
  FOR DELETE USING (auth.uid() = user_id);

-- Update the is_on_sale calculation to be more robust
UPDATE public.products SET is_on_sale = (
  sale_price IS NOT NULL AND 
  sale_price < regular_price AND
  (sale_start_date IS NULL OR sale_start_date <= NOW()) AND
  (sale_end_date IS NULL OR sale_end_date >= NOW())
) WHERE regular_price IS NOT NULL;
