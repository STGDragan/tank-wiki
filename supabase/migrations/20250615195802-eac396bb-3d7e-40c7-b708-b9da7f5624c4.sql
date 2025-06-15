
-- Update foreign key constraints to cascade deletes.
-- This ensures that when a user is deleted, all their associated data is also removed.
-- This version uses DROP IF EXISTS to be more robust.

-- For aquariums table
ALTER TABLE public.aquariums DROP CONSTRAINT IF EXISTS aquariums_user_id_fkey;
ALTER TABLE public.aquariums ADD CONSTRAINT aquariums_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- For livestock table
ALTER TABLE public.livestock DROP CONSTRAINT IF EXISTS livestock_user_id_fkey;
ALTER TABLE public.livestock ADD CONSTRAINT livestock_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- For equipment table
ALTER TABLE public.equipment DROP CONSTRAINT IF EXISTS equipment_user_id_fkey;
ALTER TABLE public.equipment ADD CONSTRAINT equipment_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- For maintenance table
ALTER TABLE public.maintenance DROP CONSTRAINT IF EXISTS maintenance_user_id_fkey;
ALTER TABLE public.maintenance ADD CONSTRAINT maintenance_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- For water_parameters table
ALTER TABLE public.water_parameters DROP CONSTRAINT IF EXISTS water_parameters_user_id_fkey;
ALTER TABLE public.water_parameters ADD CONSTRAINT water_parameters_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- For journal_entries table
ALTER TABLE public.journal_entries DROP CONSTRAINT IF EXISTS journal_entries_user_id_fkey;
ALTER TABLE public.journal_entries ADD CONSTRAINT journal_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- For wishlist_items table
ALTER TABLE public.wishlist_items DROP CONSTRAINT IF EXISTS wishlist_items_user_id_fkey;
ALTER TABLE public.wishlist_items ADD CONSTRAINT wishlist_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- For aquarium_parameter_settings table
ALTER TABLE public.aquarium_parameter_settings DROP CONSTRAINT IF EXISTS aquarium_parameter_settings_user_id_fkey;
ALTER TABLE public.aquarium_parameter_settings ADD CONSTRAINT aquarium_parameter_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- For knowledge_articles table, set author to NULL on delete
ALTER TABLE public.knowledge_articles DROP CONSTRAINT IF EXISTS knowledge_articles_author_id_fkey;
ALTER TABLE public.knowledge_articles ADD CONSTRAINT knowledge_articles_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;
