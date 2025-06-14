
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tables } from "@/integrations/supabase/types";

type WaterParameterReading = Tables<'water_parameters'>;

type HealthRankingProps = {
  waterParameters: WaterParameterReading[];
  aquariumType: string | null;
};

// NOTE: This is a simplified calculation. We can improve this logic later.
const calculateHealthScore = (waterParameters: WaterParameterReading[]): number => {
    if (!waterParameters || waterParameters.length === 0) {
        return 75; // Default score if no data
    }
    
    const latestReading = waterParameters[0]; // Assumes readings are sorted by date desc
    let score = 100;

    if (latestReading.ammonia && latestReading.ammonia > 0) score -= 30;
    if (latestReading.nitrite && latestReading.nitrite > 0) score -= 30;
    if (latestReading.nitrate && latestReading.nitrate > 40) score -= 15; // Freshwater general limit
    if (latestReading.ph && (latestReading.ph < 6.5 || latestReading.ph > 8.5)) score -= 10;

    return Math.max(0, score);
}

export const HealthRanking = ({ waterParameters, aquariumType }: HealthRankingProps) => {
    const score = calculateHealthScore(waterParameters);
    let healthStatus: string;

    if (score >= 85) {
        healthStatus = "Excellent";
    } else if (score >= 65) {
        healthStatus = "Good";
    } else if (score >= 40) {
        healthStatus = "Fair";
    } else {
        healthStatus = "Needs Attention";
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Tank Health</CardTitle>
        <CardDescription>Based on the latest water parameter readings.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
            <span className="text-lg font-bold w-32">{healthStatus}</span>
            <div className="w-full">
                <Progress value={score} />
            </div>
            <span className="text-lg font-bold">{score}%</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Note: This is a simplified estimate. The logic can be enhanced for greater accuracy.</p>
      </CardContent>
    </Card>
  );
};
