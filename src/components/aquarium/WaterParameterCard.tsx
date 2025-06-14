
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { format } from 'date-fns';

type WaterParameterReading = Tables<'water_parameters'> & {
    salinity?: number | null;
    alkalinity?: number | null;
    calcium?: number | null;
    magnesium?: number | null;
};

export const WaterParameterCard = ({ reading, aquariumType }: { reading: WaterParameterReading, aquariumType: string | null }) => {
  const isSaltwater = aquariumType?.toLowerCase() === 'saltwater';

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Reading</CardTitle>
        <p className="text-sm text-muted-foreground">{format(new Date(reading.recorded_at), 'PPP, p')}</p>
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
