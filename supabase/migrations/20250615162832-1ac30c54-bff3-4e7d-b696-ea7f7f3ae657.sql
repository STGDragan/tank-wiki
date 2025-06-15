
-- Add new columns to water_parameters table for additional tracking
ALTER TABLE public.water_parameters
ADD COLUMN gh NUMERIC,
ADD COLUMN kh NUMERIC,
ADD COLUMN co2 NUMERIC,
ADD COLUMN phosphate NUMERIC,
ADD COLUMN copper NUMERIC;

-- Create table for tank type presets
CREATE TABLE public.tank_type_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    parameter TEXT NOT NULL,
    min_value NUMERIC,
    max_value NUMERIC,
    unit TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.tank_type_presets IS 'Stores ideal parameter ranges for standard aquarium types.';

-- Enable RLS for presets table
ALTER TABLE public.tank_type_presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to presets" ON public.tank_type_presets FOR SELECT USING (true);


-- Create table for custom user-defined parameter settings per aquarium
CREATE TABLE public.aquarium_parameter_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aquarium_id UUID NOT NULL REFERENCES public.aquariums(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    parameter TEXT NOT NULL,
    min_value NUMERIC,
    max_value NUMERIC,
    unit TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (aquarium_id, parameter)
);
COMMENT ON TABLE public.aquarium_parameter_settings IS 'Stores user-defined ideal parameter ranges for a specific aquarium.';

-- Enable RLS for custom settings
ALTER TABLE public.aquarium_parameter_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own aquarium settings" ON public.aquarium_parameter_settings
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Populate the presets table with the provided data
INSERT INTO public.tank_type_presets (name, parameter, min_value, max_value, unit) VALUES
-- Freshwater (Community Fish)
('Freshwater (Community Fish)', 'Temperature', 72, 78, '°F'),
('Freshwater (Community Fish)', 'pH', 6.5, 7.5, NULL),
('Freshwater (Community Fish)', 'Ammonia', 0, 0, 'ppm'),
('Freshwater (Community Fish)', 'Nitrite', 0, 0, 'ppm'),
('Freshwater (Community Fish)', 'Nitrate', 0, 40, 'ppm'),
('Freshwater (Community Fish)', 'GH', 4, 12, 'dGH'),
('Freshwater (Community Fish)', 'KH', 3, 8, 'dKH'),

-- Planted Freshwater Tank
('Planted Freshwater Tank', 'Temperature', 72, 78, '°F'),
('Planted Freshwater Tank', 'pH', 6.5, 7.2, NULL),
('Planted Freshwater Tank', 'CO2', 15, 30, 'ppm'),
('Planted Freshwater Tank', 'Ammonia', 0, 0, 'ppm'),
('Planted Freshwater Tank', 'Nitrite', 0, 0, 'ppm'),
('Planted Freshwater Tank', 'Nitrate', 10, 20, 'ppm'),
('Planted Freshwater Tank', 'GH', 4, 10, 'dGH'),
('Planted Freshwater Tank', 'KH', 3, 6, 'dKH'),

-- Freshwater Inverts
('Freshwater Inverts', 'Temperature', 70, 78, '°F'),
('Freshwater Inverts', 'pH', 6.8, 7.5, NULL),
('Freshwater Inverts', 'Ammonia', 0, 0, 'ppm'),
('Freshwater Inverts', 'Nitrite', 0, 0, 'ppm'),
('Freshwater Inverts', 'Nitrate', 0, 20, 'ppm'),
('Freshwater Inverts', 'GH', 4, 8, 'dGH'),
('Freshwater Inverts', 'KH', 2, 6, 'dKH'),
('Freshwater Inverts', 'Copper', 0, 0, 'ppm'),

-- Saltwater Fish Only
('Saltwater Fish Only', 'Temperature', 74, 78, '°F'),
('Saltwater Fish Only', 'Salinity', 1.020, 1.025, 'SG'),
('Saltwater Fish Only', 'pH', 8.0, 8.4, NULL),
('Saltwater Fish Only', 'Ammonia', 0, 0, 'ppm'),
('Saltwater Fish Only', 'Nitrite', 0, 0, 'ppm'),
('Saltwater Fish Only', 'Nitrate', 0, 40, 'ppm'),
('Saltwater Fish Only', 'Alkalinity', 8, 12, 'dKH'),

-- Saltwater FOWLR
('Saltwater FOWLR', 'Temperature', 74, 78, '°F'),
('Saltwater FOWLR', 'Salinity', 1.023, 1.025, 'SG'),
('Saltwater FOWLR', 'pH', 8.1, 8.4, NULL),
('Saltwater FOWLR', 'Ammonia', 0, 0, 'ppm'),
('Saltwater FOWLR', 'Nitrite', 0, 0, 'ppm'),
('Saltwater FOWLR', 'Nitrate', 0, 30, 'ppm'),
('Saltwater FOWLR', 'Alkalinity', 8, 12, 'dKH'),
('Saltwater FOWLR', 'Calcium', 350, 450, 'ppm'),
('Saltwater FOWLR', 'Magnesium', 1200, 1350, 'ppm'),

-- Saltwater Softy Reef
('Saltwater Softy Reef', 'Temperature', 76, 78, '°F'),
('Saltwater Softy Reef', 'Salinity', 1.024, 1.026, 'SG'),
('Saltwater Softy Reef', 'pH', 8.1, 8.4, NULL),
('Saltwater Softy Reef', 'Alkalinity', 8, 12, 'dKH'),
('Saltwater Softy Reef', 'Calcium', 400, 450, 'ppm'),
('Saltwater Softy Reef', 'Magnesium', 1250, 1350, 'ppm'),
('Saltwater Softy Reef', 'Nitrate', 5, 15, 'ppm'),
('Saltwater Softy Reef', 'Phosphate', 0.01, 0.1, 'ppm'),

-- Saltwater Mixed Reef
('Saltwater Mixed Reef', 'Temperature', 76, 78, '°F'),
('Saltwater Mixed Reef', 'Salinity', 1.025, 1.026, 'SG'),
('Saltwater Mixed Reef', 'pH', 8.1, 8.4, NULL),
('Saltwater Mixed Reef', 'Alkalinity', 8, 11, 'dKH'),
('Saltwater Mixed Reef', 'Calcium', 400, 450, 'ppm'),
('Saltwater Mixed Reef', 'Magnesium', 1250, 1400, 'ppm'),
('Saltwater Mixed Reef', 'Nitrate', 1, 10, 'ppm'),
('Saltwater Mixed Reef', 'Phosphate', 0.01, 0.05, 'ppm'),

-- Saltwater SPS Reef
('Saltwater SPS Reef', 'Temperature', 76, 78, '°F'),
('Saltwater SPS Reef', 'Salinity', 1.025, 1.026, 'SG'),
('Saltwater SPS Reef', 'pH', 8.1, 8.4, NULL),
('Saltwater SPS Reef', 'Alkalinity', 8, 9.5, 'dKH'),
('Saltwater SPS Reef', 'Calcium', 420, 450, 'ppm'),
('Saltwater SPS Reef', 'Magnesium', 1350, 1450, 'ppm'),
('Saltwater SPS Reef', 'Nitrate', 0.25, 5, 'ppm'),
('Saltwater SPS Reef', 'Phosphate', 0.01, 0.03, 'ppm');
