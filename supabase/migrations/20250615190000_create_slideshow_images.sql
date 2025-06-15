
create table public.slideshow_images (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    image_url text not null,
    alt_text text,
    display_order integer not null default 0
);

comment on table public.slideshow_images is 'Stores images for the landing page slideshow.';
comment on column public.slideshow_images.image_url is 'URL of the image.';
comment on column public.slideshow_images.alt_text is 'Alternative text for the image for accessibility.';
comment on column public.slideshow_images.display_order is 'Order in which images appear in the slideshow.';

alter table public.slideshow_images enable row level security;

create policy "Public can read slideshow images"
on public.slideshow_images for select
using (true);

create policy "Admins can manage slideshow images"
on public.slideshow_images for all
using (public.is_admin())
with check (public.is_admin());

insert into public.slideshow_images (image_url, alt_text, display_order)
values
  ('https://images.unsplash.com/photo-1550957886-ac45931e5741?q=80&w=2070&auto=format&fit=crop', 'Colorful coral reef', 0),
  ('https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?q=80&w=2070&auto=format&fit=crop', 'A school of vibrant fish', 1),
  ('https://images.unsplash.com/photo-1618228183212-5ef6c69f2156?q=80&w=1974&auto=format&fit=crop', 'Lush underwater aquatic plants', 2),
  ('https://images.unsplash.com/photo-1587823308889-7221b046734e?q=80&w=2070&auto=format&fit=crop', 'A red cherry shrimp on a plant', 3);
