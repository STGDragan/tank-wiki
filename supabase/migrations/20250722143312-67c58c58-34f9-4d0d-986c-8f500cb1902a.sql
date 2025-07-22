-- Enable RLS on species table and create policies
ALTER TABLE public.species ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to species"
  ON public.species
  FOR SELECT
  USING (true);

CREATE POLICY "Allow admin to manage species"
  ON public.species
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));