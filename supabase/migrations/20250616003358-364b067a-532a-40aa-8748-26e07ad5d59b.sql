
-- Create slideshow_settings table (this appears to not have been created yet)
CREATE TABLE IF NOT EXISTS public.slideshow_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    autoplay_delay INTEGER NOT NULL DEFAULT 3000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT slideshow_settings_single_row CHECK (id = 1)
);

-- Insert default settings
INSERT INTO public.slideshow_settings (id, autoplay_delay) 
VALUES (1, 3000) 
ON CONFLICT (id) DO NOTHING;

-- Add missing updated_at column to slideshow_images table
ALTER TABLE public.slideshow_images 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Set up Row Level Security (RLS) for slideshow_settings
ALTER TABLE public.slideshow_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for slideshow_settings
CREATE POLICY "Anyone can view slideshow settings" ON public.slideshow_settings
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update slideshow settings" ON public.slideshow_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Create function to automatically update updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language plpgsql;

-- Create trigger for updated_at on slideshow_settings
CREATE TRIGGER handle_slideshow_settings_updated_at
    BEFORE UPDATE ON public.slideshow_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for updated_at on slideshow_images
CREATE TRIGGER handle_slideshow_images_updated_at
    BEFORE UPDATE ON public.slideshow_images
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
