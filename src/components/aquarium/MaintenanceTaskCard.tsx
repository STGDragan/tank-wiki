
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CompleteTaskDialog } from './CompleteTaskDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, Check, Trash2, Wrench, Clock, AlertTriangle, Flag } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useState } from 'react';

type MaintenanceTask = Tables<'maintenance'> & { equipment: { type: string, brand: string | null, model: string | null } | null };

interface MaintenanceTaskCardProps {
  task: MaintenanceTask;
  onMarkComplete: (taskId: string, completedDate: Date, additionalData?: any) => void;
  onDelete: (taskId: string) => void;
  hasActiveSubscription?: boolean;
}

export const MaintenanceTaskCard = ({ task, onMarkComplete, onDelete, hasActiveSubscription = false }: MaintenanceTaskCardProps) => {
  const [isCompleteDialogOpen, setCompleteDialogOpen] = useState(false);
  
  // Function to get filter type for pro users
  const getFilterTypeInfo = () => {
    if (!hasActiveSubscription || !task.equipment) return null;
    
    const equipmentType = task.equipment.type.toLowerCase();
    if (equipmentType.includes('filter')) {
      if (task.task.toLowerCase().includes('carbon')) return '🔸 Carbon Filter Media';
      if (task.task.toLowerCase().includes('mechanical')) return '🔸 Mechanical Filter Media';
      if (task.task.toLowerCase().includes('biological') || task.task.toLowerCase().includes('bio')) return '🔸 Biological Filter Media';
      if (task.task.toLowerCase().includes('sponge')) return '🔸 Sponge Filter';
      if (task.task.toLowerCase().includes('cartridge')) return '🔸 Filter Cartridge';
      return '🔸 Filter Media';
    }
    return null;
  };
  
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed_date;
  const isCompleted = !!task.completed_date;
  const isDueSoon = task.due_date && !isCompleted && !isOverdue && 
    new Date(task.due_date).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000; // Due within 3 days

  const getPriorityLevel = () => {
    if (isOverdue) return 'critical';
    if (isDueSoon) return 'high';
    if (task.frequency === 'Daily') return 'high';
    if (task.frequency === 'Weekly') return 'medium';
    return 'low';
  };

  const getPriorityColor = () => {
    const priority = getPriorityLevel();
    switch (priority) {
      case 'critical': return 'text-red-600 dark:text-red-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  const handleComplete = (taskId: string, completedDate: Date, additionalData?: any) => {
    onMarkComplete(taskId, completedDate, additionalData);
  };

  const getCardVariant = () => {
    if (isOverdue) return 'border-red-500 bg-red-50 dark:bg-red-950/20 shadow-lg';
    if (isCompleted) return 'border-green-500 bg-green-50 dark:bg-green-950/20';
    if (isDueSoon) return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 shadow-md';
    return 'bg-background border-border hover:shadow-md';
  };

  return (
    <Card className={`h-full transition-all duration-200 ${getCardVariant()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2 flex-1">
            <Flag className={`h-4 w-4 mt-1 flex-shrink-0 ${getPriorityColor()}`} />
            <CardTitle className="text-base font-semibold text-foreground leading-sn">{task.task}</CardTitle>
          </div>
          <div className="flex gap-1 ml-2">
            {isOverdue && (
              <Badge variant="destructive" className="text-xs animate-pulse">
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
          <div className="flex items-center text-sm text-muted-foreground mt-2 ml-6">
            <Wrench className="mr-1 h-3 w-3" />
            {task.equipment.type}
            {task.equipment.brand && ` (${task.equipment.brand})`}
          </div>
        )}
        
        {/* Pro feature: Filter type information */}
        {getFilterTypeInfo() && (
          <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mt-1 ml-6 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded">
            <span className="font-medium">{getFilterTypeInfo()}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {task.due_date && (
          <div className="flex items-center text-sm ml-6">
            <Calendar className="mr-2 h-4 w-4" />
            <span className={`font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
              Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
            </span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 ml-6">
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
          <div className="bg-muted/50 p-3 rounded-md ml-6">
            <p className="text-sm text-muted-foreground">{task.notes}</p>
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          {!isCompleted && (
            <Button 
              size="sm" 
              className={`flex-1 ${isOverdue ? 'bg-red-600 hover:bg-red-700' : ''}`}
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
