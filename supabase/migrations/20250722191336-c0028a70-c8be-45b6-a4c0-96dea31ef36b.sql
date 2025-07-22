-- Create water_parameters table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.water_parameters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  aquarium_id UUID NOT NULL,
  ph DECIMAL(3,1),
  temperature DECIMAL(4,1),
  ammonia DECIMAL(4,2),
  nitrite DECIMAL(4,2),
  nitrate DECIMAL(5,2),
  phosphate DECIMAL(4,2),
  alkalinity DECIMAL(5,1),
  calcium DECIMAL(6,1),
  magnesium DECIMAL(6,1),
  salinity DECIMAL(4,2),
  notes TEXT,
  tested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.water_parameters ENABLE ROW LEVEL SECURITY;

-- Create policies for water parameters
CREATE POLICY "Users can view their own water parameters" 
ON public.water_parameters 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own water parameters" 
ON public.water_parameters 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own water parameters" 
ON public.water_parameters 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own water parameters" 
ON public.water_parameters 
FOR DELETE 
USING (auth.uid() = user_id);

-- Allow aquarium sharing permissions
CREATE POLICY "Allow view for viewers on water_parameters" 
ON public.water_parameters 
FOR SELECT 
USING (check_aquarium_permission(aquarium_id, 'viewer'::permission_level));

CREATE POLICY "Allow insert for editors on water_parameters" 
ON public.water_parameters 
FOR INSERT 
WITH CHECK (check_aquarium_permission(aquarium_id, 'editor'::permission_level));

CREATE POLICY "Allow update for editors on water_parameters" 
ON public.water_parameters 
FOR UPDATE 
USING (check_aquarium_permission(aquarium_id, 'editor'::permission_level));

CREATE POLICY "Allow delete for editors on water_parameters" 
ON public.water_parameters 
FOR DELETE 
USING (check_aquarium_permission(aquarium_id, 'editor'::permission_level));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_water_parameters_updated_at
BEFORE UPDATE ON public.water_parameters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();