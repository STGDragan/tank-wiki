
ALTER TABLE public.slideshow_images ADD COLUMN context TEXT NOT NULL DEFAULT 'landing-page';
COMMENT ON COLUMN public.slideshow_images.context IS 'Identifier for where the slideshow appears, e.g., "landing-page".';
