
-- Add tldr field to knowledge_articles table
ALTER TABLE public.knowledge_articles 
ADD COLUMN IF NOT EXISTS tldr text;

-- Add a comment to describe the new field
COMMENT ON COLUMN public.knowledge_articles.tldr IS 'Short summary/TL;DR section of the article for use in wizard and quick previews';
