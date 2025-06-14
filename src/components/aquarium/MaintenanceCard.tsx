
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { Check, Trash2, Calendar, Wrench } from "lucide-react";

type MaintenanceTask = Tables<'maintenance'> & { equipment: { type: string, brand: string | null, model: string | null } | null };

interface MaintenanceCardProps {
    task: MaintenanceTask;
    onMarkComplete: (taskId: string) => void;
    onDelete: (taskId: string) => void;
}

export const MaintenanceCard = ({ task, onMarkComplete, onDelete }: MaintenanceCardProps) => {
    const isCompleted = !!task.completed_date;
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

    return (
        <Card className={`h-full flex flex-col ${isCompleted ? 'bg-muted/50 border-dashed' : ''}`}>
            <CardHeader>
                <CardTitle className="flex items-start gap-2">
                    <Wrench className={`w-5 h-5 mt-1 shrink-0 ${isCompleted ? 'text-muted-foreground' : ''}`} />
                    <span className={isCompleted ? 'line-through text-muted-foreground' : ''}>{task.task}</span>
                </CardTitle>
                <CardDescription className="flex flex-col gap-1">
                    {isCompleted ? (
                        <span className="text-green-600">Completed on {format(new Date(task.completed_date!), 'PPP')}</span>
                    ) : task.due_date ? (
                        <span className={`flex items-center gap-2 ${isOverdue ? 'text-destructive font-semibold' : ''}`}>
                            <Calendar className="w-4 h-4" />
                            Due on {format(new Date(task.due_date), 'PPP')}
                        </span>
                    ) : (
                        <span>No due date</span>
                    )}
                     {task.equipment && (
                        <span className="text-xs pt-1">
                            For: {`${task.equipment.type} (${task.equipment.brand || ''} ${task.equipment.model || ''})`.trim()}
                        </span>
                    )}
                </CardDescription>
            </CardHeader>
            {task.notes && (
                <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground italic">"{task.notes}"</p>
                </CardContent>
            )}
            <CardFooter className="mt-auto pt-4 flex justify-end gap-2">
                {!isCompleted && (
                    <Button size="sm" onClick={() => onMarkComplete(task.id)}>
                        <Check className="mr-2 h-4 w-4" /> Mark complete
                    </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => onDelete(task.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
};
