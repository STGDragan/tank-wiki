
-- Create the legal_documents table
CREATE TABLE public.legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create a trigger function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that fires on update to legal_documents
CREATE TRIGGER set_timestamp_legal_documents
BEFORE UPDATE ON public.legal_documents
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_timestamp();

-- Enable Row Level Security
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read-only access
CREATE POLICY "Allow public read access to legal documents"
ON public.legal_documents
FOR SELECT
USING (true);

-- Policy: Allow admin full access
CREATE POLICY "Allow admin to manage legal documents"
ON public.legal_documents
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
