
-- Fix function search path mutable warnings by setting search_path to 'public'

-- Update get_category_hierarchy function
CREATE OR REPLACE FUNCTION public.get_category_hierarchy()
 RETURNS TABLE(id uuid, name text, slug text, description text, parent_id uuid, level integer, path text[])
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path = public
AS $function$
  WITH RECURSIVE category_tree AS (
    -- Base case: root categories
    SELECT 
      c.id,
      c.name,
      c.slug,
      c.description,
      c.parent_id,
      0 as level,
      ARRAY[c.name] as path
    FROM public.product_categories_new c
    WHERE c.parent_id IS NULL AND c.is_active = true
    
    UNION ALL
    
    -- Recursive case: child categories
    SELECT 
      c.id,
      c.name,
      c.slug,
      c.description,
      c.parent_id,
      ct.level + 1,
      ct.path || c.name
    FROM public.product_categories_new c
    JOIN category_tree ct ON c.parent_id = ct.id
    WHERE c.is_active = true
  )
  SELECT * FROM category_tree
  ORDER BY level, name;
$function$;

-- Update update_product_updated_at function
CREATE OR REPLACE FUNCTION public.update_product_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update update_activity_logs_updated_at function
CREATE OR REPLACE FUNCTION public.update_activity_logs_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
