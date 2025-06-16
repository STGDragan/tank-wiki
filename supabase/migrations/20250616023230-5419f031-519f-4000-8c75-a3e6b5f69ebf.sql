
-- Create feedback table to store user submissions
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bug', 'suggestion', 'issue', 'general')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  browser_info JSONB,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Add Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback" 
  ON public.feedback 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can create feedback
CREATE POLICY "Users can create feedback" 
  ON public.feedback 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own feedback (in case they want to add more info)
CREATE POLICY "Users can update their own feedback" 
  ON public.feedback 
  FOR UPDATE 
  USING (auth.uid() = user_id AND status = 'open');

-- Admins can view and update all feedback
CREATE POLICY "Admins can manage all feedback" 
  ON public.feedback 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for feedback images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('feedback-images', 'feedback-images', true);

-- Storage policies for feedback images
CREATE POLICY "Users can upload feedback images" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'feedback-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view feedback images" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'feedback-images');

-- Add trigger for updated_at
CREATE TRIGGER handle_feedback_updated_at 
  BEFORE UPDATE ON public.feedback 
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();
