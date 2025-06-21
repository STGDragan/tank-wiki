
-- Create the social_media_links table
CREATE TABLE public.social_media_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL UNIQUE CHECK (platform IN ('email', 'facebook', 'instagram', 'tiktok', 'youtube')),
  url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add trigger to automatically update the updated_at column
CREATE TRIGGER update_social_media_links_updated_at
  BEFORE UPDATE ON public.social_media_links
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.social_media_links ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "Admins can view social media links" 
  ON public.social_media_links 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create social media links" 
  ON public.social_media_links 
  FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update social media links" 
  ON public.social_media_links 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete social media links" 
  ON public.social_media_links 
  FOR DELETE 
  USING (public.has_role(auth.uid(), 'admin'));

-- Create a public policy for viewing active social media links (for the footer)
CREATE POLICY "Anyone can view active social media links" 
  ON public.social_media_links 
  FOR SELECT 
  USING (is_active = true);
