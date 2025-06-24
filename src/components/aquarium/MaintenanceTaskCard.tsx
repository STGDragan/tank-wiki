
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CompleteTaskDialog } from './CompleteTaskDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, Check, Trash2, Wrench, Clock, AlertTriangle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useState } from 'react';

type MaintenanceTask = Tables<'maintenance'> & { equipment: { type: string, brand: string | null, model: string | null } | null };

interface MaintenanceTaskCardProps {
  task: MaintenanceTask;
  onMarkComplete: (taskId: string, completedDate: Date) => void;
  onDelete: (taskId: string) => void;
}

export const MaintenanceTaskCard = ({ task, onMarkComplete, onDelete }: MaintenanceTaskCardProps) => {
  const [isCompleteDialogOpen, setCompleteDialogOpen] = useState(false);
  
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed_date;
  const isCompleted = !!task.completed_date;
  const isDueSoon = task.due_date && !isCompleted && !isOverdue && 
    new Date(task.due_date).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000; // Due within 3 days

  const handleComplete = (taskId: string, completedDate: Date, additionalData?: any) => {
    onMarkComplete(taskId, completedDate);
  };

  const getCardVariant = () => {
    if (isOverdue) return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    if (isCompleted) return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    if (isDueSoon) return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    return 'bg-background border-border';
  };

  return (
    <Card className={`h-full transition-all duration-200 hover:shadow-md ${getCardVariant()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold text-foreground leading-snug flex-1">
            {task.task}
          </CardTitle>
          <div className="flex gap-1 ml-2">
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Overdue
              </Badge>
            )}
            {isDueSoon && !isOverdue && (
              <Badge variant="secondary" className="text-xs bg-yellow-500 text-white">
                <Clock className="w-3 h-3 mr-1" />
                Due Soon
              </Badge>
            )}
            {isCompleted && (
              <Badge variant="default" className="text-xs bg-green-600">
                <Check className="w-3 h-3 mr-1" />
                Done
              </Badge>
            )}
          </div>
        </div>
        
        {task.equipment && (
          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <Wrench className="mr-1 h-3 w-3" />
            {task.equipment.type}
            {task.equipment.brand && ` (${task.equipment.brand})`}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {task.due_date && (
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-4 w-4" />
            <span className={`font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
              Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
            </span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          {task.frequency && (
            <Badge variant="outline" className="text-xs">
              {task.frequency}
            </Badge>
          )}
          
          {isCompleted && (
            <Badge variant="default" className="text-xs bg-green-600">
              Completed {format(new Date(task.completed_date!), 'MMM d')}
            </Badge>
          )}
        </div>
        
        {task.notes && (
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm text-muted-foreground">{task.notes}</p>
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          {!isCompleted && (
            <Button 
              size="sm" 
              className="flex-1" 
              onClick={() => setCompleteDialogOpen(true)}
              variant={isOverdue ? "destructive" : "default"}
            >
              <Check className="mr-1 h-3 w-3" />
              {isOverdue ? "Complete Overdue" : "Complete"}
            </Button>
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
