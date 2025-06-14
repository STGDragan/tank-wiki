
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { AddMaintenanceTaskForm } from './AddMaintenanceTaskForm';
import { MaintenanceCard } from './MaintenanceCard';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type MaintenanceTask = Tables<'maintenance'> & { equipment: { type: string, brand: string | null, model: string | null } | null };

const fetchMaintenanceTasks = async (aquariumId: string): Promise<MaintenanceTask[]> => {
    const { data, error } = await supabase
        .from('maintenance')
        .select('*, equipment(type, brand, model)')
        .eq('aquarium_id', aquariumId)
        .order('completed_date', { ascending: false, nullsFirst: true })
        .order('due_date', { ascending: true, nullsFirst: false });
    
    if (error) throw new Error(error.message);
    return data as MaintenanceTask[] || [];
};

export const MaintenanceTab = ({ aquariumId }: { aquariumId: string }) => {
    const [isAddTaskOpen, setAddTaskOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: tasks, isLoading, error } = useQuery({
        queryKey: ['maintenance', aquariumId],
        queryFn: () => fetchMaintenanceTasks(aquariumId),
    });

    const updateTaskMutation = useMutation({
        mutationFn: async ({ taskId, updates }: { taskId: string, updates: Partial<Tables<'maintenance'>> }) => {
            const { error } = await supabase.from('maintenance').update(updates).eq('id', taskId);
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['maintenance', aquariumId] });
            toast({ title: 'Task updated!' });
        },
        onError: (err: Error) => {
            toast({ title: 'Error updating task', description: err.message, variant: 'destructive' });
        }
    });

    const deleteTaskMutation = useMutation({
        mutationFn: async (taskId: string) => {
            const { error } = await supabase.from('maintenance').delete().eq('id', taskId);
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['maintenance', aquariumId] });
            toast({ title: 'Task deleted!' });
        },
        onError: (err: Error) => {
            toast({ title: 'Error deleting task', description: err.message, variant: 'destructive' });
        }
    });

    const handleMarkComplete = (taskId: string) => {
        updateTaskMutation.mutate({ taskId, updates: { completed_date: new Date().toISOString() } });
    };

    const handleDelete = (taskId: string) => {
        deleteTaskMutation.mutate(taskId);
    };

    if (error) return <div className="text-destructive p-4 border border-destructive/50 rounded-md">Error: {error.message}</div>;

    const upcomingTasks = tasks?.filter(t => !t.completed_date) || [];
    const completedTasks = tasks?.filter(t => t.completed_date) || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Maintenance Schedule</h3>
                <Drawer open={isAddTaskOpen} onOpenChange={setAddTaskOpen}>
                    <DrawerTrigger asChild>
                        <Button><PlusCircle /> Add Task</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader><DrawerTitle>Add New Maintenance Task</DrawerTitle></DrawerHeader>
                        <div className="px-4 pb-4 max-h-[80vh] overflow-y-auto">
                            <AddMaintenanceTaskForm aquariumId={aquariumId} onSuccess={() => setAddTaskOpen(false)} />
                        </div>
                    </DrawerContent>
                </Drawer>
            </div>

            {isLoading ? (
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" />
                 </div>
            ) : (
                <>
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold border-b pb-2">Upcoming & Overdue</h4>
                        {upcomingTasks.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {upcomingTasks.map(task => (
                                    <MaintenanceCard key={task.id} task={task} onMarkComplete={handleMarkComplete} onDelete={handleDelete} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground pt-2">No upcoming maintenance tasks. Great job!</p>
                        )}
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold border-b pb-2">Completed</h4>
                        {completedTasks.length > 0 ? (
                             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {completedTasks.map(task => (
                                    <MaintenanceCard key={task.id} task={task} onMarkComplete={handleMarkComplete} onDelete={handleDelete} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground pt-2">No completed tasks yet.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
