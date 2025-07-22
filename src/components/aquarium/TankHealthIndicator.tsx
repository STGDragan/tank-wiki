
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, AlertCircle, Heart } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type WaterParameterReading = Tables<'water_parameters'>;
type MaintenanceTask = Tables<'maintenance'>;
type Livestock = Tables<'livestock'>;
type Equipment = Tables<'equipment'>;

interface TankHealthIndicatorProps {
  waterParameters?: WaterParameterReading[];
  maintenanceTasks?: MaintenanceTask[];
  livestock?: Livestock[];
  equipment?: Equipment[];
  aquariumType?: string | null;
  aquariumSize?: number | null;
  compact?: boolean;
  className?: string;
}

interface HealthMetrics {
  score: number;
  status: 'healthy' | 'caution' | 'critical';
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  issues: string[];
  recommendations: string[];
}

const calculateTankHealth = (
  waterParameters?: WaterParameterReading[],
  maintenanceTasks?: MaintenanceTask[],
  livestock?: Livestock[],
  equipment?: Equipment[],
  aquariumType?: string | null,
  aquariumSize?: number | null
): HealthMetrics => {
  let score = 100;
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Water Parameters (40% of score)
  if (!waterParameters || waterParameters.length === 0) {
    score -= 30;
    issues.push("No recent water tests");
    recommendations.push("Test your water parameters (ammonia, nitrite, nitrate, pH)");
  } else {
    const latest = waterParameters[0];
    const testAge = new Date().getTime() - new Date(latest.recorded_at).getTime();
    const daysOld = testAge / (1000 * 60 * 60 * 24);
    
    if (daysOld > 14) {
      score -= 20;
      issues.push("Water tests outdated");
      recommendations.push("Test water parameters weekly for optimal monitoring");
    }

    // Critical parameters
    if (latest.ammonia && latest.ammonia > 0) {
      score -= 25;
      issues.push("Ammonia detected");
      recommendations.push("Perform immediate 50% water change and check filter");
    }
    if (latest.nitrite && latest.nitrite > 0) {
      score -= 25;
      issues.push("Nitrite detected");
      recommendations.push("Increase beneficial bacteria with supplement or media");
    }
    if (latest.nitrate && latest.nitrate > 40) {
      score -= 15;
      issues.push("High nitrates");
      recommendations.push("Perform 25-30% water change and reduce feeding");
    }
  }

  // Maintenance Tasks (30% of score)
  if (maintenanceTasks) {
    const now = new Date();
    const overdueTasks = maintenanceTasks.filter(task => 
      task.due_date && new Date(task.due_date) < now && !task.completed_date
    );
    
    const recentlyCompletedTasks = maintenanceTasks.filter(task => {
      if (!task.completed_date) return false;
      const completedDate = new Date(task.completed_date);
      const daysSinceCompletion = (now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCompletion <= 7; // Completed within last 7 days
    });
    
    if (overdueTasks.length > 0) {
      score -= Math.min(overdueTasks.length * 10, 30);
      issues.push(`${overdueTasks.length} overdue maintenance task${overdueTasks.length > 1 ? 's' : ''}`);
      recommendations.push("Complete overdue maintenance tasks to maintain tank stability");
    } else if (recentlyCompletedTasks.length > 0) {
      // Bonus for recent maintenance completion
      score += Math.min(recentlyCompletedTasks.length * 2, 5);
    }
  }

  // Equipment completeness (20% of score)
  if (equipment && aquariumType) {
    const essentialEquipment = ['Filter', 'Heater', 'Light'];
    const hasEssential = essentialEquipment.filter(type => 
      equipment.some(eq => eq.type.toLowerCase().includes(type.toLowerCase()))
    );
    
    if (hasEssential.length < essentialEquipment.length) {
      score -= 15;
      issues.push("Missing essential equipment");
      const missingEquipment = essentialEquipment.filter(type => 
        !equipment.some(eq => eq.type.toLowerCase().includes(type.toLowerCase()))
      );
      recommendations.push(`Add essential equipment: ${missingEquipment.join(', ')}`);
    }
  }

  // Stocking levels (10% of score)
  if (livestock && aquariumSize) {
    const totalLivestock = livestock.reduce((sum, fish) => sum + fish.quantity, 0);
    const bioLoad = totalLivestock / (aquariumSize / 10); // Rough bioload calculation
    
    if (bioLoad > 2) {
      score -= 10;
      issues.push("High bioload");
      recommendations.push("Consider reducing livestock count or upgrading to larger tank");
    }
  }

  // Add specific recommendations based on recent activity
  if (issues.length === 0) {
    const recentlyCompletedTasks = maintenanceTasks?.filter(task => {
      if (!task.completed_date) return false;
      const completedDate = new Date(task.completed_date);
      const daysSinceCompletion = (new Date().getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCompletion <= 7;
    }) || [];
    
    if (recentlyCompletedTasks.length > 0) {
      recommendations.push(`Great job! You've completed ${recentlyCompletedTasks.length} maintenance task${recentlyCompletedTasks.length > 1 ? 's' : ''} recently`);
    }
    recommendations.push("Maintain regular water testing and maintenance schedule");
    recommendations.push("Continue monitoring your livestock for signs of stress or disease");
  }

  score = Math.max(0, Math.min(100, score));

  let status: 'healthy' | 'caution' | 'critical';
  let color: string;
  let bgColor: string;
  let icon: React.ReactNode;

  if (score >= 80) {
    status = 'healthy';
    color = 'text-green-600 dark:text-green-400';
    bgColor = 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/50';
    icon = <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
  } else if (score >= 60) {
    status = 'caution';
    color = 'text-yellow-600 dark:text-yellow-400';
    bgColor = 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800/50';
    icon = <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
  } else {
    status = 'critical';
    color = 'text-red-600 dark:text-red-400';
    bgColor = 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800/50';
    icon = <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />;
  }

  return { score, status, color, bgColor, icon, issues, recommendations };
};

export function TankHealthIndicator({
  waterParameters,
  maintenanceTasks,
  livestock,
  equipment,
  aquariumType,
  aquariumSize,
  compact = false,
  className = ""
}: TankHealthIndicatorProps) {
  const health = calculateTankHealth(
    waterParameters,
    maintenanceTasks,
    livestock,
    equipment,
    aquariumType,
    aquariumSize
  );

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {health.icon}
        <Badge variant={health.status === 'healthy' ? 'default' : 'destructive'} className="text-xs">
          {health.score}% Health
        </Badge>
      </div>
    );
  }

  return (
    <Card className={`${health.bgColor} border ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Tank Health</h3>
          </div>
          <div className="flex items-center gap-2">
            {health.icon}
            <span className={`font-bold ${health.color}`}>
              {health.score}%
            </span>
          </div>
        </div>
        
        <Progress value={health.score} className="mb-3" />
        
        <div className="space-y-1">
          <p className={`text-sm font-medium ${health.color}`}>
            Status: {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
          </p>
          
          {(health.issues.length > 0 || health.recommendations.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {health.issues.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Issues Detected
                  </p>
                  <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                    {health.issues.map((issue, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {health.recommendations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    💡 Recommendations
                  </p>
                  <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                    {health.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
