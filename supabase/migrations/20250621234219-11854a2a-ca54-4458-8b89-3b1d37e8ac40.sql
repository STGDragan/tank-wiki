
-- Update the trigger function to properly handle first_name and last_name from signup data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, first_name, last_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  );
  RETURN NEW;
END;
$$;

-- Update existing profiles that might be missing first_name and last_name data
-- Extract from full_name if it exists and first_name/last_name are empty
UPDATE public.profiles 
SET 
  first_name = CASE 
    WHEN (first_name IS NULL OR first_name = '') AND full_name IS NOT NULL AND full_name != '' THEN
      TRIM(SPLIT_PART(full_name, ' ', 1))
    ELSE first_name
  END,
  last_name = CASE 
    WHEN (last_name IS NULL OR last_name = '') AND full_name IS NOT NULL AND full_name != '' THEN
      TRIM(SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1))
    ELSE last_name
  END
WHERE (first_name IS NULL OR first_name = '' OR last_name IS NULL OR last_name = '');
