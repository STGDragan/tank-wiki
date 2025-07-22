
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CompleteTaskDialog } from './CompleteTaskDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, Check, Trash2, Wrench } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useState } from 'react';

type MaintenanceTask = Tables<'maintenance'> &  { equipment: { type: string, brand: string | null, model: string | null } | null };

interface MaintenanceCardProps {
  task: MaintenanceTask;
  onMarkComplete: (taskId: string, completedDate: Date, additionalData?: any) => void;
  onDelete: (taskId: string) => void;
}

export const MaintenanceCard = ({ task, onMarkComplete, onDelete }: MaintenanceCardProps) => {
  const [isCompleteDialogOpen, setCompleteDialogOpen] = useState(false);
  
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed_date;
  const isCompleted = !!task.completed_date;

  const handleComplete = (taskId: string, completedDate: Date, additionalData?: any) => {
    onMarkComplete(taskId, completedDate, additionalData);
  };

  return (
    <Card className={`h-full ${isOverdue ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : isCompleted ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'bg-background'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground leading-snug">
          {task.task}
        </CardTitle>
        {task.equipment && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Wrench className="mr-1 h-3 w-3" />
            {task.equipment.type}
            {task.equipment.brand && ` (${task.equipment.brand})`}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {task.due_date && (
          <div className="flex items-center text-sm text-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span className="font-medium">
              Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
            </span>
          </div>
        )}
        
        {task.frequency && (
          <Badge variant="outline" className="text-xs">
            {task.frequency}
          </Badge>
        )}
        
        {isOverdue && (
          <Badge variant="destructive" className="text-xs">
            Overdue
          </Badge>
        )}
        
        {isCompleted && (
          <Badge variant="default" className="text-xs bg-green-600">
            Completed {format(new Date(task.completed_date!), 'MMM d')}
          </Badge>
        )}
        
        {task.notes && (
          <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
            {task.notes}
          </p>
        )}
        
        <div className="flex gap-2 pt-2">
          {!isCompleted && (
            <>
              <Button size="sm" className="flex-1" onClick={() => setCompleteDialogOpen(true)}>
                <Check className="mr-1 h-3 w-3" />
                Complete
              </Button>
            </>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-shrink-0">
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Task</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this maintenance task? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(task.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
      
      <CompleteTaskDialog
        task={task}
        isOpen={isCompleteDialogOpen}
        onOpenChange={setCompleteDialogOpen}
        onComplete={handleComplete}
      />
    </Card>
  );
};
