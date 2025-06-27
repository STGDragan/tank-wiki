
-- Fix RLS policies for cms_settings to allow authenticated users to manage sponsorships
-- First, let's check what policies exist and update them

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Admins can manage settings" ON public.cms_settings;
DROP POLICY IF EXISTS "Anyone can view settings" ON public.cms_settings;

-- Create more permissive policies for authenticated users
-- Allow authenticated users to view all settings
CREATE POLICY "Authenticated users can view settings" ON public.cms_settings
  FOR SELECT USING (true);

-- Allow authenticated users to insert/update settings (for sponsorships and other CMS content)
CREATE POLICY "Authenticated users can manage settings" ON public.cms_settings
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Ensure the table has RLS enabled
ALTER TABLE public.cms_settings ENABLE ROW LEVEL SECURITY;
