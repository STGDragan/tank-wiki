
-- Create a public bucket for knowledge base article content images (separate from main article images)
insert into storage.buckets
  (id, name, public)
values
  ('knowledge_base_content_images', 'knowledge_base_content_images', true)
on conflict (id) do nothing;

-- Allow public read access to all files in the bucket
create policy "Public read access for knowledge_base_content_images"
on storage.objects for select
using ( bucket_id = 'knowledge_base_content_images' );

-- Allow authenticated users to upload images
create policy "Authenticated users can upload content images to knowledge base"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'knowledge_base_content_images' );

-- Allow users to update their own images
create policy "Users can update their own knowledge base content images"
on storage.objects for update
to authenticated
using ( auth.uid() = owner );

-- Allow users to delete their own images
create policy "Users can delete their own knowledge base content images"
on storage.objects for delete
to authenticated
using ( auth.uid() = owner );

-- Add html_content column to knowledge_articles table for rich HTML content
alter table public.knowledge_articles
add column if not exists html_content text;

-- Add content_type column to track whether article uses plain text or HTML
alter table public.knowledge_articles
add column if not exists content_type text default 'text';
