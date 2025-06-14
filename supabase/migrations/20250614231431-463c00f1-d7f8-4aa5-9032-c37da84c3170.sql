
-- Add category and subcategory columns to the products table
ALTER TABLE public.products ADD COLUMN category TEXT;
ALTER TABLE public.products ADD COLUMN subcategory TEXT;
