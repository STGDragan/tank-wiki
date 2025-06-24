
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type MaintenanceTask = Tables<'maintenance'> & { equipment: { type: string, brand: string | null, model: string | null } | null };

interface MaintenanceStatsProps {
  tasks: MaintenanceTask[];
}

export const MaintenanceStats = ({ tasks }: MaintenanceStatsProps) => {
  const completedTasks = tasks.filter(task => task.completed_date);
  const overdueTasks = tasks.filter(task => 
    task.due_date && 
    new Date(task.due_date) < new Date() && 
    !task.completed_date
  );
  const dueSoonTasks = tasks.filter(task => 
    task.due_date && 
    !task.completed_date && 
    !overdueTasks.includes(task) &&
    new Date(task.due_date).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000
  );
  const upcomingTasks = tasks.filter(task => 
    task.due_date && 
    !task.completed_date && 
    !overdueTasks.includes(task) && 
    !dueSoonTasks.includes(task)
  );

  const stats = [
    {
      title: "Completed",
      value: completedTasks.length,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "Overdue",
      value: overdueTasks.length,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20"
    },
    {
      title: "Due Soon",
      value: dueSoonTasks.length,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20"
    },
    {
      title: "Upcoming",
      value: upcomingTasks.length,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className={`${stat.bgColor} border-0`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
