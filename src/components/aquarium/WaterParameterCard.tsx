
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { format } from 'date-fns';

type WaterParameterReading = Tables<'water_parameters'> & {
    salinity?: number | null;
    alkalinity?: number | null;
    calcium?: number | null;
    magnesium?: number | null;
};

interface WaterParameterCardProps {
  reading: WaterParameterReading;
  aquariumType: string | null;
  onDelete?: () => void;
}

export const WaterParameterCard = ({ reading, aquariumType, onDelete }: WaterParameterCardProps) => {
  const isSaltwater = aquariumType?.toLowerCase() === 'saltwater';

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Reading</CardTitle>
          <p className="text-sm text-muted-foreground">{format(new Date(reading.recorded_at), 'PPP, p')}</p>
        </div>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 text-sm">
        <p>Temp: {reading.temperature ?? 'N/A'}</p>
        <p>pH: {reading.ph ?? 'N/A'}</p>
        <p>Ammonia: {reading.ammonia ?? 'N/A'}</p>
        <p>Nitrite: {reading.nitrite ?? 'N/A'}</p>
        <p>Nitrate: {reading.nitrate ?? 'N/A'}</p>
        {isSaltwater && (
          <>
            <p>Salinity: {reading.salinity ?? 'N/A'}</p>
            <p>Alkalinity: {reading.alkalinity ?? 'N/A'}</p>
            <p>Calcium: {reading.calcium ?? 'N/A'}</p>
            <p>Magnesium: {reading.magnesium ?? 'N/A'}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
