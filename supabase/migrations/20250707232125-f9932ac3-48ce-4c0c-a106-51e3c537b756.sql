-- Add missing columns for multiple subcategories and images
-- First, check if columns already exist before adding them
DO $$ 
BEGIN
  -- Add subcategories column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'subcategories') THEN
    ALTER TABLE products ADD COLUMN subcategories text[] DEFAULT NULL;
  END IF;
  
  -- Add images column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'images') THEN
    ALTER TABLE products ADD COLUMN images text[] DEFAULT NULL;
  END IF;
  
  -- Add inventory tracking fields if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'track_inventory') THEN
    ALTER TABLE products ADD COLUMN track_inventory boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock_quantity') THEN
    ALTER TABLE products ADD COLUMN stock_quantity integer DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'low_stock_threshold') THEN
    ALTER TABLE products ADD COLUMN low_stock_threshold integer DEFAULT 5;
  END IF;
END $$;

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.update_product_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_updated_at();