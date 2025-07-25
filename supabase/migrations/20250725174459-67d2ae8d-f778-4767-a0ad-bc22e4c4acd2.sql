-- Enable RLS on product_category_assignments table
ALTER TABLE public.product_category_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for product_category_assignments
CREATE POLICY "Allow admin to manage product category assignments" 
ON public.product_category_assignments 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Allow public read access to product category assignments" 
ON public.product_category_assignments 
FOR SELECT 
USING (true);