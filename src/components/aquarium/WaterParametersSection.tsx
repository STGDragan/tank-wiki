
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { AddWaterParameterForm } from '@/components/aquarium/AddWaterParameterForm';
import { PlusCircle, TestTube2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { format } from 'date-fns';

type WaterParameterReading = Tables<'water_parameters'>;

interface WaterParametersSectionProps {
  aquariumId: string;
  aquariumType: string | null;
  latestReading: WaterParameterReading | undefined;
}

export const WaterParametersSection = ({ aquariumId, aquariumType, latestReading }: WaterParametersSectionProps) => {
  const [isAddWaterParamsOpen, setAddWaterParamsOpen] = useState(false);
  const isSaltwater = aquariumType?.toLowerCase().includes('saltwater');
  const isFreshwater = aquariumType === "Freshwater";
  const isSaltwaterFO = aquariumType === "Saltwater Fish-Only (FO)";

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center text-2xl">
            <TestTube2 className="mr-3 h-6 w-6" />
            Water Parameters
          </CardTitle>
          <CardDescription className="mt-2">View the latest water quality readings for your aquarium.</CardDescription>
        </div>
        <Drawer open={isAddWaterParamsOpen} onOpenChange={setAddWaterParamsOpen}>
          <DrawerTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Reading</Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader><DrawerTitle>Add New Water Parameter Reading</DrawerTitle></DrawerHeader>
            <div className="px-4 pb-4">
                <AddWaterParameterForm aquariumId={aquariumId} aquariumType={aquariumType} onSuccess={() => setAddWaterParamsOpen(false)} />
            </div>
          </DrawerContent>
        </Drawer>
      </CardHeader>
      <CardContent>
            {!latestReading ? (
                <p className="text-muted-foreground text-center py-8">No water parameter readings yet.</p>
            ) : (
                <>
                    <p className="text-sm text-muted-foreground mb-4">Last reading on: {format(new Date(latestReading.recorded_at), 'PPP, p')}</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                        <div><span className="font-semibold text-muted-foreground mr-1">Temp:</span> {latestReading.temperature != null ? <>{latestReading.temperature}<span className="text-muted-foreground text-xs ml-1">°F</span></> : 'N/A'}</div>
                        <div><span className="font-semibold text-muted-foreground mr-1">pH:</span> {latestReading.ph ?? 'N/A'}</div>
                        <div><span className="font-semibold text-muted-foreground mr-1">Ammonia:</span> {latestReading.ammonia != null ? <>{latestReading.ammonia}<span className="text-muted-foreground text-xs ml-1">ppm</span></> : 'N/A'}</div>
                        <div><span className="font-semibold text-muted-foreground mr-1">Nitrite:</span> {latestReading.nitrite != null ? <>{latestReading.nitrite}<span className="text-muted-foreground text-xs ml-1">ppm</span></> : 'N/A'}</div>
                        <div><span className="font-semibold text-muted-foreground mr-1">Nitrate:</span> {latestReading.nitrate != null ? <>{latestReading.nitrate}<span className="text-muted-foreground text-xs ml-1">ppm</span></> : 'N/A'}</div>
                        
                        {/* Hide GH and KH for freshwater AND saltwater fish-only tanks */}
                        {!isFreshwater && !isSaltwaterFO && latestReading.gh != null && <div><span className="font-semibold text-muted-foreground mr-1">GH:</span> {latestReading.gh}<span className="text-muted-foreground text-xs ml-1">dGH</span></div>}
                        {!isFreshwater && !isSaltwaterFO && latestReading.kh != null && <div><span className="font-semibold text-muted-foreground mr-1">KH:</span> {latestReading.kh}<span className="text-muted-foreground text-xs ml-1">dKH</span></div>}
                        {latestReading.co2 != null && <div><span className="font-semibold text-muted-foreground mr-1">CO2:</span> {latestReading.co2}<span className="text-muted-foreground text-xs ml-1">ppm</span></div>}
                        {latestReading.phosphate != null && <div><span className="font-semibold text-muted-foreground mr-1">Phosphate:</span> {latestReading.phosphate}<span className="text-muted-foreground text-xs ml-1">ppm</span></div>}
                        {latestReading.copper != null && <div><span className="font-semibold text-muted-foreground mr-1">Copper:</span> {latestReading.copper}<span className="text-muted-foreground text-xs ml-1">ppm</span></div>}
                        
                        {isSaltwater && (
                            <>
                                <div><span className="font-semibold text-muted-foreground mr-1">Salinity:</span> {latestReading.salinity != null ? <>{latestReading.salinity}<span className="text-muted-foreground text-xs ml-1">ppt</span></> : 'N/A'}</div>
                                <div><span className="font-semibold text-muted-foreground mr-1">Alkalinity:</span> {latestReading.alkalinity != null ? <>{latestReading.alkalinity}<span className="text-muted-foreground text-xs ml-1">dKH</span></> : 'N/A'}</div>
                                <div><span className="font-semibold text-muted-foreground mr-1">Calcium:</span> {latestReading.calcium != null ? <>{latestReading.calcium}<span className="text-muted-foreground text-xs ml-1">ppm</span></> : 'N/A'}</div>
                                <div><span className="font-semibold text-muted-foreground mr-1">Magnesium:</span> {latestReading.magnesium != null ? <>{latestReading.magnesium}<span className="text-muted-foreground text-xs ml-1">ppm</span></> : 'N/A'}</div>
                            </>
                        )}
                    </div>
                </>
            )}
        </CardContent>
    </Card>
  );
};
