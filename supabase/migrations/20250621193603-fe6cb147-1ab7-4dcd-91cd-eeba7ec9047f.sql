
-- Add affiliate_url column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS affiliate_url text;

-- Create a settings table for global configuration
CREATE TABLE IF NOT EXISTS public.cms_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on cms_settings table
ALTER TABLE public.cms_settings ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage settings
CREATE POLICY "Admins can manage settings" ON public.cms_settings
  FOR ALL USING (public.is_admin());

-- Allow public read access to settings (needed for affiliate tag processing)
CREATE POLICY "Anyone can view settings" ON public.cms_settings
  FOR SELECT USING (true);

-- Insert default Amazon affiliate tag setting
INSERT INTO public.cms_settings (key, value, description) 
VALUES ('amazon_affiliate_tag', 'travisdraga07-20', 'Default Amazon affiliate tag to append to product URLs')
ON CONFLICT (key) DO NOTHING;

-- Create function to extract ASIN and format Amazon URL
CREATE OR REPLACE FUNCTION public.format_amazon_affiliate_url(input_url text, affiliate_tag text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  asin_match text;
  clean_url text;
  final_tag text;
BEGIN
  -- Return null if input is null or empty
  IF input_url IS NULL OR trim(input_url) = '' THEN
    RETURN NULL;
  END IF;
  
  -- Use provided affiliate tag or get from settings
  IF affiliate_tag IS NULL THEN
    SELECT value INTO final_tag FROM public.cms_settings WHERE key = 'amazon_affiliate_tag';
  ELSE
    final_tag := affiliate_tag;
  END IF;
  
  -- Return original URL if no affiliate tag is configured
  IF final_tag IS NULL OR trim(final_tag) = '' THEN
    RETURN input_url;
  END IF;
  
  -- Extract ASIN from various Amazon URL formats
  -- Pattern 1: /dp/ASIN
  asin_match := substring(input_url from '/dp/([A-Z0-9]{10})');
  
  -- Pattern 2: /gp/product/ASIN
  IF asin_match IS NULL THEN
    asin_match := substring(input_url from '/gp/product/([A-Z0-9]{10})');
  END IF;
  
  -- Pattern 3: /product/ASIN
  IF asin_match IS NULL THEN
    asin_match := substring(input_url from '/product/([A-Z0-9]{10})');
  END IF;
  
  -- Pattern 4: ASIN in query parameter
  IF asin_match IS NULL THEN
    asin_match := substring(input_url from '[?&]ASIN=([A-Z0-9]{10})');
  END IF;
  
  -- If we found an ASIN, format the clean URL
  IF asin_match IS NOT NULL THEN
    clean_url := 'https://www.amazon.com/dp/' || asin_match || '?tag=' || final_tag;
    RETURN clean_url;
  END IF;
  
  -- If no ASIN found, return original URL
  RETURN input_url;
END;
$function$;

-- Since there's no amazon_url column in products table, we'll need to add one
-- or work with existing affiliate_links table
-- Let's add amazon_url column for future use
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS amazon_url text;

-- Create trigger function to automatically format Amazon URLs on product insert/update
CREATE OR REPLACE FUNCTION public.auto_format_amazon_urls()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Process amazon_url field if it exists and contains amazon domain
  IF NEW.amazon_url IS NOT NULL AND NEW.amazon_url ILIKE '%amazon.%' THEN
    NEW.affiliate_url := public.format_amazon_affiliate_url(NEW.amazon_url);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for products table
DROP TRIGGER IF EXISTS auto_format_amazon_urls_trigger ON public.products;
CREATE TRIGGER auto_format_amazon_urls_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_format_amazon_urls();
