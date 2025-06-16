
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

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
  const [selectedPreset, setSelectedPreset] = useState(() => {
    const preset = PRESET_DELAYS.find(p => p.value === currentDelay);
    return preset ? preset.value.toString() : "0";
  });
  const [customDelay, setCustomDelay] = useState(currentDelay);

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    const numValue = parseInt(value);
    if (numValue > 0) {
      onDelayChange(numValue);
      setCustomDelay(numValue);
    }
  };

  const handleCustomDelayChange = (value: number[]) => {
    const delay = value[0];
    setCustomDelay(delay);
    onDelayChange(delay);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Slideshow Speed</CardTitle>
        <CardDescription>
          Control how quickly images change in the slideshow
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
          Current delay: {(selectedPreset === "0" ? customDelay : parseInt(selectedPreset)) / 1000} seconds
        </div>
      </CardContent>
    </Card>
  );
}
