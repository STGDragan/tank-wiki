
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useUserPreferences } from "@/hooks/useUserPreferences";

export function VolumeUnitSelector() {
  const { preferences, updatePreferences, loading } = useUserPreferences();

  if (loading || !preferences) return null;

  return (
    <div className="space-y-2">
      <Label htmlFor="volume-unit">Volume Units</Label>
      <Select
        value={preferences.units_volume}
        onValueChange={(value: 'gallons' | 'liters') => 
          updatePreferences({ units_volume: value })
        }
      >
        <SelectTrigger id="volume-unit" className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="gallons">Gallons</SelectItem>
          <SelectItem value="liters">Liters</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
