
-- Step 1: Create a new ENUM type for permission levels
CREATE TYPE public.permission_level AS ENUM ('viewer', 'editor');

-- Step 2: Create the table to store aquarium shares
CREATE TABLE public.aquarium_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aquarium_id UUID NOT NULL REFERENCES public.aquariums(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission public.permission_level NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(aquarium_id, shared_with_user_id)
);

-- Step 3: Enable RLS and define policies for the new table
ALTER TABLE public.aquarium_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage their shares" ON public.aquarium_shares FOR ALL USING (auth.uid() = owner_user_id);
CREATE POLICY "Shared users can see their shares" ON public.aquarium_shares FOR SELECT USING (auth.uid() = shared_with_user_id);


-- Step 4: Create a helper function to check permissions
-- This function is SECURITY DEFINER, so it runs with the privileges of the user who defined it.
-- This allows it to bypass RLS to check for ownership and shares.
CREATE OR REPLACE FUNCTION public.check_aquarium_permission(
  _aquarium_id UUID,
  _permission_level public.permission_level
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _owner_id UUID;
  _user_id UUID := auth.uid();
  _share_permission public.permission_level;
BEGIN
  -- Get the owner of the aquarium
  SELECT user_id INTO _owner_id FROM public.aquariums WHERE id = _aquarium_id;

  -- The owner always has full permission
  IF _owner_id = _user_id THEN
    RETURN TRUE;
  END IF;

  -- Check if the aquarium is shared with the current user
  SELECT permission INTO _share_permission
  FROM public.aquarium_shares
  WHERE aquarium_id = _aquarium_id AND shared_with_user_id = _user_id;

  -- If no share found, no permission
  IF _share_permission IS NULL THEN
    RETURN FALSE;
  END IF;

  -- If required permission is 'viewer', both 'viewer' and 'editor' are sufficient
  IF _permission_level = 'viewer' AND (_share_permission = 'viewer' OR _share_permission = 'editor') THEN
    RETURN TRUE;
  END IF;

  -- If required permission is 'editor', only 'editor' is sufficient
  IF _permission_level = 'editor' AND _share_permission = 'editor' THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;


-- Step 5: Enable RLS and create policies for all relevant tables

-- Table: aquariums
ALTER TABLE public.aquariums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own or shared aquariums" ON public.aquariums FOR SELECT USING (public.check_aquarium_permission(id, 'viewer'));
CREATE POLICY "Users can create own aquariums" ON public.aquariums FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Editors can update own or shared aquariums" ON public.aquariums FOR UPDATE USING (public.check_aquarium_permission(id, 'editor'));
CREATE POLICY "Owners can delete own aquariums" ON public.aquariums FOR DELETE USING (auth.uid() = user_id);

-- Table: livestock
ALTER TABLE public.livestock ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for viewers on livestock" ON public.livestock FOR SELECT USING (public.check_aquarium_permission(aquarium_id, 'viewer'));
CREATE POLICY "Allow insert for editors on livestock" ON public.livestock FOR INSERT WITH CHECK (public.check_aquarium_permission(aquarium_id, 'editor'));
CREATE POLICY "Allow update for editors on livestock" ON public.livestock FOR UPDATE USING (public.check_aquarium_permission(aquarium_id, 'editor'));
CREATE POLICY "Allow delete for editors on livestock" ON public.livestock FOR DELETE USING (public.check_aquarium_permission(aquarium_id, 'editor'));

-- Table: equipment
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for viewers on equipment" ON public.equipment FOR SELECT USING (public.check_aquarium_permission(aquarium_id, 'viewer'));
CREATE POLICY "Allow insert for editors on equipment" ON public.equipment FOR INSERT WITH CHECK (public.check_aquarium_permission(aquarium_id, 'editor'));
CREATE POLICY "Allow update for editors on equipment" ON public.equipment FOR UPDATE USING (public.check_aquarium_permission(aquarium_id, 'editor'));
CREATE POLICY "Allow delete for editors on equipment" ON public.equipment FOR DELETE USING (public.check_aquarium_permission(aquarium_id, 'editor'));

-- Table: maintenance
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for viewers on maintenance" ON public.maintenance FOR SELECT USING (public.check_aquarium_permission(aquarium_id, 'viewer'));
CREATE POLICY "Allow insert for editors on maintenance" ON public.maintenance FOR INSERT WITH CHECK (public.check_aquarium_permission(aquarium_id, 'editor'));
CREATE POLICY "Allow update for editors on maintenance" ON public.maintenance FOR UPDATE USING (public.check_aquarium_permission(aquarium_id, 'editor'));
CREATE POLICY "Allow delete for editors on maintenance" ON public.maintenance FOR DELETE USING (public.check_aquarium_permission(aquarium_id, 'editor'));

-- Table: water_parameters
ALTER TABLE public.water_parameters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for viewers on water_parameters" ON public.water_parameters FOR SELECT USING (public.check_aquarium_permission(aquarium_id, 'viewer'));
CREATE POLICY "Allow insert for editors on water_parameters" ON public.water_parameters FOR INSERT WITH CHECK (public.check_aquarium_permission(aquarium_id, 'editor'));
CREATE POLICY "Allow update for editors on water_parameters" ON public.water_parameters FOR UPDATE USING (public.check_aquarium_permission(aquarium_id, 'editor'));
CREATE POLICY "Allow delete for editors on water_parameters" ON public.water_parameters FOR DELETE USING (public.check_aquarium_permission(aquarium_id, 'editor'));

-- Table: journal_entries
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for viewers on journal_entries" ON public.journal_entries FOR SELECT USING (public.check_aquarium_permission(aquarium_id, 'viewer'));
CREATE POLICY "Allow insert for editors on journal_entries" ON public.journal_entries FOR INSERT WITH CHECK (public.check_aquarium_permission(aquarium_id, 'editor'));
CREATE POLICY "Allow update for editors on journal_entries" ON public.journal_entries FOR UPDATE USING (public.check_aquarium_permission(aquarium_id, 'editor'));
CREATE POLICY "Allow delete for editors on journal_entries" ON public.journal_entries FOR DELETE USING (public.check_aquarium_permission(aquarium_id, 'editor'));

-- Table: wishlist_items
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for viewers on wishlist_items" ON public.wishlist_items FOR SELECT USING (public.check_aquarium_permission(aquarium_id, 'viewer'));
CREATE POLICY "Allow insert for editors on wishlist_items" ON public.wishlist_items FOR INSERT WITH CHECK (public.check_aquarium_permission(aquarium_id, 'editor'));
CREATE POLICY "Allow update for editors on wishlist_items" ON public.wishlist_items FOR UPDATE USING (public.check_aquarium_permission(aquarium_id, 'editor'));
CREATE POLICY "Allow delete for editors on wishlist_items" ON public.wishlist_items FOR DELETE USING (public.check_aquarium_permission(aquarium_id, 'editor'));

-- Table: aquarium_parameter_settings
ALTER TABLE public.aquarium_parameter_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for viewers on aquarium_parameter_settings" ON public.aquarium_parameter_settings FOR SELECT USING (public.check_aquarium_permission(aquarium_id, 'viewer'));
CREATE POLICY "Allow insert for editors on aquarium_parameter_settings" ON public.aquarium_parameter_settings FOR INSERT WITH CHECK (public.check_aquarium_permission(aquarium_id, 'editor'));
CREATE POLICY "Allow update for editors on aquarium_parameter_settings" ON public.aquarium_parameter_settings FOR UPDATE USING (public.check_aquarium_permission(aquarium_id, 'editor'));
CREATE POLICY "Allow delete for editors on aquarium_parameter_settings" ON public.aquarium_parameter_settings FOR DELETE USING (public.check_aquarium_permission(aquarium_id, 'editor'));
