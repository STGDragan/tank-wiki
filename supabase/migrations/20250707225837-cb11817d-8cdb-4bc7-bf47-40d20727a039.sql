
-- Add support for multiple subcategories as an array
ALTER TABLE products ADD COLUMN subcategories text[] DEFAULT NULL;

-- Add support for multiple images as an array
ALTER TABLE products ADD COLUMN images text[] DEFAULT NULL;

-- Add inventory tracking fields
ALTER TABLE products ADD COLUMN track_inventory boolean DEFAULT false;
ALTER TABLE products ADD COLUMN stock_quantity integer DEFAULT NULL;
ALTER TABLE products ADD COLUMN low_stock_threshold integer DEFAULT 5;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_updated_at();
