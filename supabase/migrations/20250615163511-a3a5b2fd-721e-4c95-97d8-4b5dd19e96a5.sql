
-- Create a table for knowledge base categories
CREATE TABLE public.knowledge_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for knowledge base articles
CREATE TABLE public.knowledge_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft' or 'published'
  author_id UUID REFERENCES auth.users(id),
  category_id UUID REFERENCES public.knowledge_categories(id) ON DELETE SET NULL,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for categories
ALTER TABLE public.knowledge_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access to categories
CREATE POLICY "Allow public read access to categories"
ON public.knowledge_categories
FOR SELECT USING (true);

-- Allow admin to manage categories
CREATE POLICY "Allow admin to manage categories"
ON public.knowledge_categories
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Enable RLS for articles
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published articles
CREATE POLICY "Allow public read access to published articles"
ON public.knowledge_articles
FOR SELECT USING (status = 'published');

-- Allow admin to see all articles
CREATE POLICY "Allow admin to see all articles"
ON public.knowledge_articles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admin to manage articles
CREATE POLICY "Allow admin to manage articles"
ON public.knowledge_articles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
