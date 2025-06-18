
-- First, let's add the missing price column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price NUMERIC;

-- Clean up duplicate/unnecessary columns in products table
-- Remove redundant sale-related columns, keeping only the essential ones
ALTER TABLE public.products DROP COLUMN IF EXISTS onsale;
ALTER TABLE public.products DROP COLUMN IF EXISTS featured;
ALTER TABLE public.products DROP COLUMN IF EXISTS onSale;

-- Update the is_on_sale column to be computed based on sale dates and price
UPDATE public.products SET is_on_sale = (
  sale_price IS NOT NULL AND 
  sale_price < regular_price AND
  (sale_start_date IS NULL OR sale_start_date <= NOW()) AND
  (sale_end_date IS NULL OR sale_end_date >= NOW())
) WHERE regular_price IS NOT NULL;

-- Add foreign key constraints only if they don't exist
DO $$ 
BEGIN
    -- Check and add affiliate_links foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'affiliate_links_product_id_fkey'
    ) THEN
        ALTER TABLE public.affiliate_links 
        ADD CONSTRAINT affiliate_links_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
    END IF;

    -- Check and add order_items product foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'order_items_product_id_fkey'
    ) THEN
        ALTER TABLE public.order_items 
        ADD CONSTRAINT order_items_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;
    END IF;

    -- Check and add product_reviews foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'product_reviews_product_id_fkey'
    ) THEN
        ALTER TABLE public.product_reviews 
        ADD CONSTRAINT product_reviews_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
    END IF;

    -- Check and add shopping_cart foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'shopping_cart_product_id_fkey'
    ) THEN
        ALTER TABLE public.shopping_cart 
        ADD CONSTRAINT shopping_cart_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
    END IF;

    -- Check and add orders user foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'orders_user_id_fkey'
    ) THEN
        ALTER TABLE public.orders 
        ADD CONSTRAINT orders_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create updated_at triggers for tables that need them
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers where missing
DROP TRIGGER IF EXISTS set_timestamp ON public.products;
CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp ON public.orders;
CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp ON public.shopping_cart;
CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.shopping_cart
  FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Enable RLS on all e-commerce tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products (public read access) - drop existing first
DROP POLICY IF EXISTS "Anyone can view visible products" ON public.products;
CREATE POLICY "Anyone can view visible products" ON public.products
  FOR SELECT USING (visible = true);

DROP POLICY IF EXISTS "Admin can manage products" ON public.products;
CREATE POLICY "Admin can manage products" ON public.products
  FOR ALL USING (public.is_admin());

-- Create RLS policies for shopping cart (users can only see their own)
DROP POLICY IF EXISTS "Users can view their own cart" ON public.shopping_cart;
CREATE POLICY "Users can view their own cart" ON public.shopping_cart
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own cart" ON public.shopping_cart;
CREATE POLICY "Users can manage their own cart" ON public.shopping_cart
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for orders (users can only see their own)
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can view all orders" ON public.orders;
CREATE POLICY "Admin can view all orders" ON public.orders
  FOR SELECT USING (public.is_admin());

-- Create RLS policies for order items (linked to orders)
DROP POLICY IF EXISTS "Users can view their order items" ON public.order_items;
CREATE POLICY "Users can view their order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admin can view all order items" ON public.order_items;
CREATE POLICY "Admin can view all order items" ON public.order_items
  FOR SELECT USING (public.is_admin());

-- Create RLS policies for product reviews
DROP POLICY IF EXISTS "Anyone can view product reviews" ON public.product_reviews;
CREATE POLICY "Anyone can view product reviews" ON public.product_reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON public.product_reviews;
CREATE POLICY "Users can create reviews" ON public.product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reviews" ON public.product_reviews;
CREATE POLICY "Users can update their own reviews" ON public.product_reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for affiliate links (public read access)
DROP POLICY IF EXISTS "Anyone can view affiliate links" ON public.affiliate_links;
CREATE POLICY "Anyone can view affiliate links" ON public.affiliate_links
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage affiliate links" ON public.affiliate_links;
CREATE POLICY "Admin can manage affiliate links" ON public.affiliate_links
  FOR ALL USING (public.is_admin());

-- Create RLS policies for discount codes (public read for active codes)
DROP POLICY IF EXISTS "Anyone can view active discount codes" ON public.discount_codes;
CREATE POLICY "Anyone can view active discount codes" ON public.discount_codes
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin can manage discount codes" ON public.discount_codes;
CREATE POLICY "Admin can manage discount codes" ON public.discount_codes
  FOR ALL USING (public.is_admin());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON public.products(subcategory);
CREATE INDEX IF NOT EXISTS idx_products_visible ON public.products(visible);
CREATE INDEX IF NOT EXISTS idx_products_is_on_sale ON public.products(is_on_sale);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_user_id ON public.shopping_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON public.discount_codes(code);
