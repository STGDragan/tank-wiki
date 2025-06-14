
-- Create a public bucket for aquarium-related images
insert into storage.buckets
  (id, name, public)
values
  ('aquarium_images', 'aquarium_images', true)
on conflict (id) do nothing;

-- Allow public read access to all files in the bucket
create policy "Public read access for aquarium_images"
on storage.objects for select
using ( bucket_id = 'aquarium_images' );

-- Allow authenticated users to upload images
create policy "Authenticated users can upload images"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'aquarium_images' );

-- Allow users to update their own images
create policy "Users can update their own images"
on storage.objects for update
to authenticated
using ( auth.uid() = owner );

-- Allow users to delete their own images
create policy "Users can delete their own images"
on storage.objects for delete
to authenticated
using ( auth.uid() = owner );

-- Add image_url column to aquariums table
alter table public.aquariums
add column if not exists image_url text;

-- Add image_url column to livestock table
alter table public.livestock
add column if not exists image_url text;

-- Add image_url column to equipment table
alter table public.equipment
add column if not exists image_url text;
