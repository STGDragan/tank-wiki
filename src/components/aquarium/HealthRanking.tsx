
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tables } from "@/integrations/supabase/types";

type WaterParameterReading = Tables<'water_parameters'>;
type MaintenanceTask = Tables<'maintenance'>;

type HealthRankingProps = {
  waterParameters: WaterParameterReading[];
  tasks: MaintenanceTask[];
  aquariumType: string | null;
};

// NOTE: This is a simplified calculation. We can improve this logic later.
const calculateHealthScore = (waterParameters: WaterParameterReading[], tasks: MaintenanceTask[]): number => {
    let score = 100;
    
    // Default score if no data, but still penalize for overdue tasks
    if (!waterParameters || waterParameters.length === 0) {
        score = 75; 
    } else {
        const latestReading = waterParameters[0]; // Assumes readings are sorted by date desc

        // Water parameter scoring
        if (latestReading.ammonia && latestReading.ammonia > 0.25) score -= 30;
        if (latestReading.nitrite && latestReading.nitrite > 0.25) score -= 30;
        if (latestReading.nitrate && latestReading.nitrate > 40) score -= 15; // General limit
        if (latestReading.ph && (latestReading.ph < 6.5 || latestReading.ph > 8.5)) score -= 10;
    }

    // Maintenance task scoring
    const overdueTasks = tasks.filter(task => 
        task.due_date && new Date(task.due_date) < new Date() && !task.completed_date
    );

    // Deduct points for each overdue task, up to a max penalty
    const penaltyPerTask = 5;
    const maxPenalty = 25;
    const maintenancePenalty = Math.min(overdueTasks.length * penaltyPerTask, maxPenalty);
    score -= maintenancePenalty;

    return Math.max(0, score);
}

export const HealthRanking = ({ waterParameters, tasks, aquariumType }: HealthRankingProps) => {
    const score = calculateHealthScore(waterParameters, tasks);
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
        <CardDescription>Based on the latest water parameter readings and overdue tasks.</CardDescription>
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
