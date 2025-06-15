
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { format } from 'date-fns';
import { TestTube2 } from 'lucide-react';

type WaterParameterReading = Tables<'water_parameters'>;

interface LastTestSectionProps {
    latestReading: WaterParameterReading | undefined;
    aquariumType: string | null;
}

export const LastTestSection = ({ latestReading, aquariumType }: LastTestSectionProps) => {
    const isSaltwater = aquariumType?.toLowerCase().includes('saltwater');

    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold flex items-center">
                    <TestTube2 className="mr-2 h-6 w-6" /> Last Test Results
                </h2>
            </div>
            
            {!latestReading ? (
                <p className="text-muted-foreground">No water parameter readings yet.</p>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Latest Reading</CardTitle>
                        <p className="text-sm text-muted-foreground">{format(new Date(latestReading.recorded_at), 'PPP, p')}</p>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                        <div><span className="font-semibold text-muted-foreground mr-1">Temp:</span> {latestReading.temperature != null ? <>{latestReading.temperature}<span className="text-muted-foreground text-xs ml-1">°F</span></> : 'N/A'}</div>
                        <div><span className="font-semibold text-muted-foreground mr-1">pH:</span> {latestReading.ph ?? 'N/A'}</div>
                        <div><span className="font-semibold text-muted-foreground mr-1">Ammonia:</span> {latestReading.ammonia != null ? <>{latestReading.ammonia}<span className="text-muted-foreground text-xs ml-1">ppm</span></> : 'N/A'}</div>
                        <div><span className="font-semibold text-muted-foreground mr-1">Nitrite:</span> {latestReading.nitrite != null ? <>{latestReading.nitrite}<span className="text-muted-foreground text-xs ml-1">ppm</span></> : 'N/A'}</div>
                        <div><span className="font-semibold text-muted-foreground mr-1">Nitrate:</span> {latestReading.nitrate != null ? <>{latestReading.nitrate}<span className="text-muted-foreground text-xs ml-1">ppm</span></> : 'N/A'}</div>
                        
                        {latestReading.gh != null && <div><span className="font-semibold text-muted-foreground mr-1">GH:</span> {latestReading.gh}<span className="text-muted-foreground text-xs ml-1">dGH</span></div>}
                        {latestReading.kh != null && <div><span className="font-semibold text-muted-foreground mr-1">KH:</span> {latestReading.kh}<span className="text-muted-foreground text-xs ml-1">dKH</span></div>}
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
                    </CardContent>
                </Card>
            )}
        </section>
    );
};
