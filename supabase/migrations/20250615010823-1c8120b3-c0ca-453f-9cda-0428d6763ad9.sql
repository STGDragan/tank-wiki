
-- Update foreign key for equipment to cascade on delete
ALTER TABLE public.equipment DROP CONSTRAINT equipment_aquarium_id_fkey;
ALTER TABLE public.equipment
ADD CONSTRAINT equipment_aquarium_id_fkey
FOREIGN KEY (aquarium_id)
REFERENCES public.aquariums(id)
ON DELETE CASCADE;

-- Update foreign key for livestock to cascade on delete
ALTER TABLE public.livestock DROP CONSTRAINT livestock_aquarium_id_fkey;
ALTER TABLE public.livestock
ADD CONSTRAINT livestock_aquarium_id_fkey
FOREIGN KEY (aquarium_id)
REFERENCES public.aquariums(id)
ON DELETE CASCADE;

-- Update foreign key for journal_entries to cascade on delete
ALTER TABLE public.journal_entries DROP CONSTRAINT journal_entries_aquarium_id_fkey;
ALTER TABLE public.journal_entries
ADD CONSTRAINT journal_entries_aquarium_id_fkey
FOREIGN KEY (aquarium_id)
REFERENCES public.aquariums(id)
ON DELETE CASCADE;

-- Update foreign key for maintenance to cascade on delete
ALTER TABLE public.maintenance DROP CONSTRAINT maintenance_aquarium_id_fkey;
ALTER TABLE public.maintenance
ADD CONSTRAINT maintenance_aquarium_id_fkey
FOREIGN KEY (aquarium_id)
REFERENCES public.aquariums(id)
ON DELETE CASCADE;

-- Update foreign key for water_parameters to cascade on delete
ALTER TABLE public.water_parameters DROP CONSTRAINT water_parameters_aquarium_id_fkey;
ALTER TABLE public.water_parameters
ADD CONSTRAINT water_parameters_aquarium_id_fkey
FOREIGN KEY (aquarium_id)
REFERENCES public.aquariums(id)
ON DELETE CASCADE;

-- Update foreign key for wishlist_items to cascade on delete
ALTER TABLE public.wishlist_items DROP CONSTRAINT wishlist_items_aquarium_id_fkey;
ALTER TABLE public.wishlist_items
ADD CONSTRAINT wishlist_items_aquarium_id_fkey
FOREIGN KEY (aquarium_id)
REFERENCES public.aquariums(id)
ON DELETE CASCADE;
