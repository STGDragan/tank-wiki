
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Check, AlertTriangle, Clock } from "lucide-react";
import { CompleteTaskDialog } from "@/components/aquarium/CompleteTaskDialog";
import { useAquariumMutations } from "@/hooks/useAquariumMutations";
import { format } from "date-fns";

interface UpcomingMaintenanceTrackerProps {
  aquariums: Array<{ id: string; name: string; type: string | null; size: number | null }>;
}

export function UpcomingMaintenanceTracker({ aquariums }: UpcomingMaintenanceTrackerProps) {
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isCompleteDialogOpen, setCompleteDialogOpen] = useState(false);

  const { data: upcomingTasks = [] } = useQuery({
    queryKey: ["upcoming-maintenance-dashboard", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("maintenance")
        .select(`
          *,
          aquariums!inner(name),
          equipment(type, brand, model)
        `)
        .eq("user_id", user.id)
        .is("completed_date", null)
        .gte("due_date", new Date().toISOString().split('T')[0])
        .lte("due_date", new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order("due_date", { ascending: true })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { handleMarkComplete, handleSkipTask } = useAquariumMutations(undefined, user?.id, upcomingTasks);

  const handleCompleteTask = (task: any) => {
    setSelectedTask(task);
    setCompleteDialogOpen(true);
  };

  const onComplete = (taskId: string, completedDate: Date, additionalData?: any) => {
    handleMarkComplete(taskId, completedDate, additionalData);
    setCompleteDialogOpen(false);
    setSelectedTask(null);
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const isDueSoon = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  return (
    <>
      <Card className="cyber-card glass-panel">
        <CardHeader>
          <CardTitle className="text-primary font-display flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Upcoming Maintenance
          </CardTitle>
          <CardDescription className="text-muted-foreground font-mono">
            Tasks due in the next 2 weeks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {upcomingTasks.map((task) => {
                const overdue = isOverdue(task.due_date);
                const dueSoon = isDueSoon(task.due_date);
                
                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      overdue 
                        ? 'border-red-500/50 bg-red-900/20' 
                        : dueSoon 
                        ? 'border-yellow-500/50 bg-yellow-900/20'
                        : 'border-border bg-background/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground truncate">
                          {task.task}
                        </h4>
                        {overdue && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                        {dueSoon && !overdue && (
                          <Badge variant="secondary" className="text-xs bg-yellow-500 text-white">
                            <Clock className="w-3 h-3 mr-1" />
                            Due Soon
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-mono">{task.aquariums?.name}</span>
                        {task.due_date && (
                          <span className="ml-2">
                            Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                      {task.equipment && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {task.equipment.type}
                          {task.equipment.brand && ` (${task.equipment.brand})`}
                        </div>
                      )}
                    </div>
                      <Button
                      size="sm"
                      onClick={() => handleCompleteTask(task)}
                      className={`ml-3 ${
                        overdue 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      }`}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No upcoming maintenance tasks</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTask && (
        <CompleteTaskDialog
          task={selectedTask}
          isOpen={isCompleteDialogOpen}
          onOpenChange={setCompleteDialogOpen}
          onComplete={onComplete}
          onSkip={(taskId, skipDate, newDueDate, reason) => {
            handleSkipTask(taskId, skipDate, newDueDate, reason);
            setCompleteDialogOpen(false);
            setSelectedTask(null);
          }}
        />
      )}
    </>
  );
}
