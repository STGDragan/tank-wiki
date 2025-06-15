
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";
import { addDays, addWeeks, addMonths } from "date-fns";

type MaintenanceTask = Tables<'maintenance'> & { equipment: { type: string, brand: string | null, model: string | null } | null };

export const useAquariumMutations = (aquariumId: string | undefined, userId: string | undefined, tasks: MaintenanceTask[] | undefined) => {
    const queryClient = useQueryClient();

    const completeTaskMutation = useMutation({
        mutationFn: async ({ taskId, completedDate }: { taskId: string, completedDate: Date }) => {
            const taskToComplete = tasks?.find(t => t.id === taskId);
            if (!taskToComplete) throw new Error("Task not found");
            if (!userId) throw new Error("User not found");

            const { error: updateError } = await supabase.from('maintenance').update({ completed_date: completedDate.toISOString() }).eq('id', taskId);
            if (updateError) throw updateError;
            
            if (taskToComplete.frequency) {
                const calculateNextDueDate = (lastCompleted: Date, frequency: string): Date => {
                    switch (frequency) {
                        case 'daily': return addDays(lastCompleted, 1);
                        case 'weekly': return addWeeks(lastCompleted, 1);
                        case 'every 2 weeks': return addWeeks(lastCompleted, 2);
                        case 'monthly': return addMonths(lastCompleted, 1);
                        default: return addWeeks(lastCompleted, 1);
                    }
                };
                const nextDueDate = calculateNextDueDate(completedDate, taskToComplete.frequency);
                const newTask: TablesInsert<'maintenance'> = {
                    aquarium_id: taskToComplete.aquarium_id,
                    user_id: userId,
                    task: taskToComplete.task,
                    notes: taskToComplete.notes,
                    due_date: nextDueDate.toISOString(),
                    equipment_id: taskToComplete.equipment_id,
                    frequency: taskToComplete.frequency,
                };
                const { error: insertError } = await supabase.from('maintenance').insert(newTask);
                if (insertError) throw insertError;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['maintenance', aquariumId] });
            toast({ title: 'Task completed!' });
        },
        onError: (err: Error) => {
            toast({ title: 'Error completing task', description: err.message, variant: 'destructive' });
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

    const deleteEquipmentMutation = useMutation({
        mutationFn: async (equipmentId: string) => {
            const { error } = await supabase.from('equipment').delete().eq('id', equipmentId);
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipment', aquariumId] });
            toast({ title: 'Equipment removed' });
        },
        onError: (err: Error) => {
            toast({ title: 'Error removing equipment', description: err.message, variant: 'destructive' });
        }
    });

    const deleteLivestockMutation = useMutation({
        mutationFn: async (livestockId: string) => {
            const { error } = await supabase.from('livestock').delete().eq('id', livestockId);
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['livestock', aquariumId] });
            toast({ title: 'Livestock removed' });
        },
        onError: (err: Error) => {
            toast({ title: 'Error removing livestock', description: err.message, variant: 'destructive' });
        }
    });

    const updateLivestockQuantityMutation = useMutation({
        mutationFn: async ({ livestockId, newQuantity }: { livestockId: string, newQuantity: number }) => {
            if (newQuantity <= 0) {
                const { error } = await supabase.from('livestock').delete().eq('id', livestockId);
                if (error) throw new Error(error.message);
            } else {
                const { error } = await supabase.from('livestock').update({ quantity: newQuantity }).eq('id', livestockId);
                if (error) throw new Error(error.message);
            }
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['livestock', aquariumId] });
            const message = variables.newQuantity <= 0 ? 'Livestock removed' : 'Livestock quantity updated';
            toast({ title: message });
        },
        onError: (err: Error) => {
            toast({ title: 'Error updating livestock quantity', description: err.message, variant: 'destructive' });
        }
    });

    const handleMarkComplete = (taskId: string, completedDate: Date) => {
        completeTaskMutation.mutate({ taskId, completedDate });
    };

    const handleUpdateLivestockQuantity = (livestockId: string, currentQuantity: number, change: number) => {
        const newQuantity = currentQuantity + change;
        updateLivestockQuantityMutation.mutate({ livestockId, newQuantity });
    };

    const handleDeleteTask = (taskId: string) => {
        deleteTaskMutation.mutate(taskId);
    };

    const handleDeleteLivestock = (livestockId: string) => {
        deleteLivestockMutation.mutate(livestockId);
    };

    const handleDeleteEquipment = (equipmentId: string) => {
        deleteEquipmentMutation.mutate(equipmentId);
    };

    return {
        handleMarkComplete,
        handleUpdateLivestockQuantity,
        handleDeleteTask,
        handleDeleteLivestock,
        handleDeleteEquipment,
    };
};
