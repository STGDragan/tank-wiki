
-- Create a public bucket for knowledge base article images
insert into storage.buckets
  (id, name, public)
values
  ('knowledge_base_images', 'knowledge_base_images', true)
on conflict (id) do nothing;

-- Allow public read access to all files in the bucket
create policy "Public read access for knowledge_base_images"
on storage.objects for select
using ( bucket_id = 'knowledge_base_images' );

-- Allow authenticated users to upload images
create policy "Authenticated users can upload images to knowledge base"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'knowledge_base_images' );

-- Allow users to update their own images
create policy "Users can update their own knowledge base images"
on storage.objects for update
to authenticated
using ( auth.uid() = owner );

-- Allow users to delete their own knowledge base images
create policy "Users can delete their own knowledge base images"
on storage.objects for delete
to authenticated
using ( auth.uid() = owner );

-- Add image_url column to knowledge_articles table
alter table public.knowledge_articles
add column if not exists image_url text;
