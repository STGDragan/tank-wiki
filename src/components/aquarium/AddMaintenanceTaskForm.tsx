
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tables, TablesInsert } from "@/integrations/supabase/types";

const maintenanceTaskSchema = z.object({
  task: z.string().min(1, "Task description is required."),
  notes: z.string().optional(),
  due_date: z.date().optional(),
  equipment_id: z.string().optional(),
});

type Equipment = Pick<Tables<'equipment'>, 'id' | 'type' | 'brand' | 'model'>;

const fetchEquipmentForSelect = async (aquariumId: string): Promise<Equipment[]> => {
    const { data, error } = await supabase
        .from('equipment')
        .select('id, type, brand, model')
        .eq('aquarium_id', aquariumId);

    if (error) {
        throw new Error(error.message);
    }
    return data || [];
};

export const AddMaintenanceTaskForm = ({ aquariumId, onSuccess }: { aquariumId: string, onSuccess: () => void }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    
    const { data: equipmentList } = useQuery({
        queryKey: ['equipmentForSelect', aquariumId],
        queryFn: () => fetchEquipmentForSelect(aquariumId),
        enabled: !!aquariumId,
    });

    const form = useForm<z.infer<typeof maintenanceTaskSchema>>({
        resolver: zodResolver(maintenanceTaskSchema),
        defaultValues: {
            task: "",
            notes: "",
            equipment_id: "",
        },
    });

    async function onSubmit(values: z.infer<typeof maintenanceTaskSchema>) {
        if (!user) {
            toast({ title: "Error", description: "You must be logged in to add a task.", variant: "destructive" });
            return;
        }

        const newMaintenanceTask: TablesInsert<'maintenance'> = {
            aquarium_id: aquariumId,
            user_id: user.id,
            task: values.task,
            notes: values.notes || null,
            due_date: values.due_date ? values.due_date.toISOString() : null,
            equipment_id: values.equipment_id || null,
        };

        const { error } = await supabase.from("maintenance").insert(newMaintenanceTask);

        if (error) {
            toast({ title: "Error adding maintenance task", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Success", description: "Maintenance task added." });
            queryClient.invalidateQueries({ queryKey: ['maintenance', aquariumId] });
            onSuccess();
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="task"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Task</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Water Change 25%" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="equipment_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Related Equipment (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select equipment" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="">None</SelectItem>
                                    {equipmentList?.map(eq => (
                                        <SelectItem key={eq.id} value={eq.id}>
                                            {`${eq.type} (${eq.brand || ''} ${eq.model || ''})`.trim()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Due Date (Optional)</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Any details about the task..." {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                    {form.formState.isSubmitting ? "Adding..." : "Add Task"}
                </Button>
            </form>
        </Form>
    );
};
