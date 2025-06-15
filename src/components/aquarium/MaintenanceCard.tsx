
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { Tables } from '@/integrations/supabase/types';
import { CompleteTaskDialog } from './CompleteTaskDialog';

type MaintenanceTask = Tables<'maintenance'> & { equipment: { type: string, brand: string | null, model: string | null } | null };

interface MaintenanceCardProps {
  task: MaintenanceTask;
  onMarkComplete: (taskId: string, completedDate: Date, additionalData?: any) => void;
  onDelete: (taskId: string) => void;
}

export const MaintenanceCard = ({ task, onMarkComplete, onDelete }: MaintenanceCardProps) => {
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  
  const isCompleted = !!task.completed_date;
  const isOverdue = task.due_date && isBefore(new Date(task.due_date), new Date()) && !isCompleted;
  const isUpcoming = task.due_date && isAfter(new Date(task.due_date), new Date()) && !isCompleted;

  const getStatusBadge = () => {
    if (isCompleted) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
    }
    if (isOverdue) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    if (isUpcoming) {
      return <Badge variant="secondary">Upcoming</Badge>;
    }
    return <Badge variant="outline">No Due Date</Badge>;
  };

  const getStatusIcon = () => {
    if (isCompleted) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (isOverdue) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
    return <CalendarDays className="h-4 w-4 text-blue-600" />;
  };

  return (
    <>
      <Card className={`h-full ${isOverdue ? 'border-red-200 bg-red-50' : isCompleted ? 'border-green-200 bg-green-50' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <CardTitle className="text-sm font-medium">{task.task}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          {getStatusBadge()}
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {task.due_date && (
            <CardDescription className="text-xs">
              Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
            </CardDescription>
          )}
          {task.completed_date && (
            <CardDescription className="text-xs">
              Completed: {format(new Date(task.completed_date), 'MMM d, yyyy')}
            </CardDescription>
          )}
          {task.equipment && (
            <CardDescription className="text-xs">
              Equipment: {task.equipment.type}
              {task.equipment.brand && ` (${task.equipment.brand})`}
            </CardDescription>
          )}
          {task.frequency && (
            <CardDescription className="text-xs">
              Frequency: {task.frequency}
            </CardDescription>
          )}
          {task.notes && (
            <CardDescription className="text-xs">
              {task.notes}
            </CardDescription>
          )}
          {!isCompleted && (
            <Button
              size="sm"
              className="w-full mt-3"
              onClick={() => setIsCompleteDialogOpen(true)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Task
            </Button>
          )}
        </CardContent>
      </Card>

      <CompleteTaskDialog
        task={task}
        isOpen={isCompleteDialogOpen}
        onOpenChange={setIsCompleteDialogOpen}
        onComplete={onMarkComplete}
      />
    </>
  );
};
