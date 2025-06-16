
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SlideshowConfigProps {
  onDelayChange: (delay: number) => void;
  currentDelay?: number;
}

const PRESET_DELAYS = [
  { label: "Very Fast (1 second)", value: 1000 },
  { label: "Fast (2 seconds)", value: 2000 },
  { label: "Normal (3 seconds)", value: 3000 },
  { label: "Slow (5 seconds)", value: 5000 },
  { label: "Very Slow (8 seconds)", value: 8000 },
  { label: "Custom", value: 0 },
];

export function SlideshowConfig({ onDelayChange, currentDelay = 3000 }: SlideshowConfigProps) {
  const queryClient = useQueryClient();
  
  // Query for current settings
  const { data: settings } = useQuery({
    queryKey: ["slideshow_settings"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("slideshow_settings")
        .select("*")
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const [selectedPreset, setSelectedPreset] = useState(() => {
    const delay = settings?.autoplay_delay || currentDelay;
    const preset = PRESET_DELAYS.find(p => p.value === delay);
    return preset ? preset.value.toString() : "0";
  });
  const [customDelay, setCustomDelay] = useState(settings?.autoplay_delay || currentDelay);

  // Update state when settings load
  useEffect(() => {
    if (settings) {
      const delay = settings.autoplay_delay;
      const preset = PRESET_DELAYS.find(p => p.value === delay);
      setSelectedPreset(preset ? preset.value.toString() : "0");
      setCustomDelay(delay);
      onDelayChange(delay);
    }
  }, [settings, onDelayChange]);

  // Mutation to save settings
  const saveMutation = useMutation({
    mutationFn: async (delay: number) => {
      const { data, error } = await (supabase as any)
        .from("slideshow_settings")
        .upsert({ 
          id: 1, // Use a fixed ID for singleton settings
          autoplay_delay: delay,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slideshow_settings"] });
      toast.success("Slideshow settings saved successfully!");
    },
    onError: (error) => {
      console.error("Error saving slideshow settings:", error);
      toast.error("Failed to save slideshow settings");
    },
  });

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    const numValue = parseInt(value);
    if (numValue > 0) {
      setCustomDelay(numValue);
      onDelayChange(numValue);
      saveMutation.mutate(numValue);
    }
  };

  const handleCustomDelayChange = (value: number[]) => {
    const delay = value[0];
    setCustomDelay(delay);
    onDelayChange(delay);
    saveMutation.mutate(delay);
  };

  const currentEffectiveDelay = selectedPreset === "0" ? customDelay : parseInt(selectedPreset);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Slideshow Speed</CardTitle>
        <CardDescription>
          Control how quickly images change in the slideshow. Changes are saved automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="speed-preset">Speed Preset</Label>
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select speed preset" />
            </SelectTrigger>
            <SelectContent>
              {PRESET_DELAYS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value.toString()}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPreset === "0" && (
          <div className="space-y-2">
            <Label>Custom Delay: {customDelay / 1000} seconds</Label>
            <Slider
              value={[customDelay]}
              onValueChange={handleCustomDelayChange}
              min={500}
              max={10000}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0.5s</span>
              <span>10s</span>
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          Current delay: {currentEffectiveDelay / 1000} seconds
          {saveMutation.isPending && " (Saving...)"}
        </div>
      </CardContent>
    </Card>
  );
}
