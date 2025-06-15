
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tables } from "@/integrations/supabase/types";

type WaterParameterReading = Tables<'water_parameters'>;
type MaintenanceTask = Tables<'maintenance'>;
type Preset = Tables<'tank_type_presets'>;
type CustomSetting = Tables<'aquarium_parameter_settings'>;

type HealthRankingProps = {
  waterParameters: WaterParameterReading[];
  tasks: MaintenanceTask[];
  aquariumType: string | null;
  presets: Preset[];
  customSettings: CustomSetting[];
};

const getIdealRange = (parameter: keyof WaterParameterReading, presets: Preset[], customSettings: CustomSetting[]): { min: number; max: number } | null => {
    const custom = customSettings.find(s => s.parameter?.toLowerCase() === (parameter as string).toLowerCase());
    if (custom && (custom.min_value != null || custom.max_value != null)) {
        return { min: custom.min_value ?? -Infinity, max: custom.max_value ?? Infinity };
    }

    const preset = presets.find(p => p.parameter?.toLowerCase() === (parameter as string).toLowerCase());
    if (preset && (preset.min_value != null || preset.max_value != null)) {
        return { min: preset.min_value ?? -Infinity, max: preset.max_value ?? Infinity };
    }

    return null;
}

const calculateHealthScore = (
    waterParameters: WaterParameterReading[], 
    tasks: MaintenanceTask[],
    presets: Preset[],
    customSettings: CustomSetting[],
): number => {
    let score = 100;
    
    if (!waterParameters || waterParameters.length === 0) {
        score = 75; 
    } else {
        const latestReading = waterParameters[0];

        const parametersToTest: (keyof WaterParameterReading)[] = [
            'temperature', 'ph', 'ammonia', 'nitrite', 'nitrate',
            'salinity', 'alkalinity', 'calcium', 'magnesium',
            'gh', 'kh', 'co2', 'phosphate', 'copper'
        ];

        parametersToTest.forEach(param => {
            // The value can be a string or a number from the form, so we ensure it's a number.
            const value = typeof latestReading[param] === 'string' 
                ? parseFloat(latestReading[param] as string) 
                : latestReading[param];

            if (value == null || isNaN(value)) return;

            const range = getIdealRange(param, presets, customSettings);
            if (!range) return;

            if (value < range.min || value > range.max) {
                // Larger penalties for critical params like ammonia, nitrite, copper
                if (['ammonia', 'nitrite', 'copper'].includes(param) && value > (range.max ?? 0)) {
                    score -= 30;
                } else {
                    score -= 15;
                }
            }
        });
    }

    const overdueTasks = tasks.filter(task => 
        task.due_date && new Date(task.due_date) < new Date() && !task.completed_date
    );

    const penaltyPerTask = 5;
    const maxPenalty = 25;
    const maintenancePenalty = Math.min(overdueTasks.length * penaltyPerTask, maxPenalty);
    score -= maintenancePenalty;

    return Math.max(0, score);
}

export const HealthRanking = ({ waterParameters, tasks, aquariumType, presets, customSettings }: HealthRankingProps) => {
    const score = calculateHealthScore(waterParameters, tasks, presets, customSettings);
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
        <CardDescription>Based on water parameters and overdue tasks.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
            <span className="text-lg font-bold w-32">{healthStatus}</span>
            <div className="w-full">
                <Progress value={score} />
            </div>
            <span className="text-lg font-bold">{score}%</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Health score is now calculated based on ideal parameters for {aquariumType || 'your tank'}.</p>
      </CardContent>
    </Card>
  );
};
