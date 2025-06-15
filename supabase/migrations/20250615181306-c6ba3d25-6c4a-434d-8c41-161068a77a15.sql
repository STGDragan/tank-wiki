
-- Create the is_admin function to check for admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

-- Create a public bucket for slideshow images
insert into storage.buckets
  (id, name, public)
values
  ('slideshow_images', 'slideshow_images', true)
on conflict (id) do nothing;

-- Allow public read access to all files in the bucket
create policy "Public read access for slideshow_images"
on storage.objects for select
to public
using ( bucket_id = 'slideshow_images' );

-- Allow authenticated admins to upload images
create policy "Admins can upload to slideshow_images"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'slideshow_images' AND public.is_admin() );

-- Allow admins to update images in the slideshow bucket
create policy "Admins can update slideshow_images"
on storage.objects for update
to authenticated
using ( bucket_id = 'slideshow_images' AND public.is_admin() )
with check ( bucket_id = 'slideshow_images' AND public.is_admin() );

-- Allow admins to delete from the slideshow bucket
create policy "Admins can delete from slideshow_images"
on storage.objects for delete
to authenticated
using ( bucket_id = 'slideshow_images' AND public.is_admin() );
