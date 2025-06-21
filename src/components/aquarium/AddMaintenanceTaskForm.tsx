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
import React from "react";
import { TaskCombobox } from "./TaskCombobox";
import { EquipmentCombobox } from "./EquipmentCombobox";
import { Input } from "@/components/ui/input";

const maintenanceTaskSchema = z.object({
  task: z.string().min(1, "Task description is required."),
  notes: z.string().optional(),
  due_date: z.date().optional(),
  equipment_id: z.string().optional(),
  frequency: z.string().optional(),
  custom_frequency: z.string().optional(),
  volume_changed: z.coerce.number({ invalid_type_error: "Please enter a valid number." }).optional().nullable(),
});

type Equipment = Pick<Tables<'equipment'>, 'id' | 'type' | 'brand' | 'model'>;

const commonEquipmentData = {
  freshwater: [
    "Filter",
    "Heater",
    "Thermometer",
    "Lighting",
    "Air Pump & Air Stone",
    "Powerhead",
  ],
  saltwater: [
    "Protein Skimmer",
    "Sump/Refugium",
    "Powerhead/Wavemaker",
    "RO/DI Unit",
    "Auto Top-Off (ATO)",
    "Lighting (Reef-Grade)",
    "Heater",
    "UV Sterilizer",
    "Refractometer",
  ],
};

const topMaintenanceTasks = [
    "Water Change 25%",
    "Water Change 50%",
    "Test Water Parameters",
    "Clean Filter",
    "Clean Algae from Glass",
    "Gravel Vacuum",
    "Trim Plants",
    "Dose Fertilizers",
];

const frequencyOptions = [
    { value: "once", label: "Once" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "every 2 weeks", label: "Every 2 Weeks" },
    { value: "monthly", label: "Monthly" },
    { value: "custom", label: "Custom" },
];

const fetchUserMaintenanceTasks = async (userId: string): Promise<string[]> => {
    const { data, error } = await supabase
        .from('maintenance')
        .select('task')
        .eq('user_id', userId)
        .limit(100);

    if (error) {
        console.error("Error fetching user tasks", error);
        return [];
    }
    if (!data) return [];
    
    const uniqueTasks = [...new Set(data.map(item => item.task))];
    return uniqueTasks;
};

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

export const AddMaintenanceTaskForm = ({ aquariumId, onSuccess, aquariumType, initialTask, aquariumSize }: { aquariumId: string, onSuccess: () => void, aquariumType: string | null, initialTask?: string, aquariumSize?: number | null }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    
    const { data: equipmentList } = useQuery({
        queryKey: ['equipmentForSelect', aquariumId],
        queryFn: () => fetchEquipmentForSelect(aquariumId),
        enabled: !!aquariumId,
    });

    const { data: userTasks } = useQuery({
        queryKey: ['userMaintenanceTasks', user?.id],
        queryFn: () => fetchUserMaintenanceTasks(user!.id),
        enabled: !!user,
    });

    const maintenanceTaskOptions = React.useMemo(() => {
        const baseTasks = topMaintenanceTasks.map(task => ({ value: task, label: task }));
        if (!userTasks) return baseTasks;

        const combinedTasks = [...topMaintenanceTasks, ...userTasks];
        const uniqueTasks = [...new Set(combinedTasks)];
        return uniqueTasks.map(task => ({
            value: task,
            label: task,
        }));
    }, [userTasks]);

    const equipmentOptions = React.useMemo(() => {
        const existing = equipmentList?.map(eq => ({
            value: eq.id,
            label: `${eq.type} (${eq.brand || ''} ${eq.model || ''})`.trim()
        })) || [];

        const tankTypeKey = aquariumType?.toLowerCase() === 'saltwater' ? 'saltwater' : 'freshwater';
        const commonForType = commonEquipmentData[tankTypeKey] || [];
        
        const common = commonForType.map(eq => ({
            value: eq,
            label: eq,
        }));

        const existingTypes = new Set(equipmentList?.map(eq => eq.type.toLowerCase()));
        const filteredCommon = common.filter(c => !existingTypes.has(c.label.toLowerCase()));

        return [...existing, ...filteredCommon];
    }, [equipmentList, aquariumType]);

    const form = useForm<z.infer<typeof maintenanceTaskSchema>>({
        resolver: zodResolver(maintenanceTaskSchema),
        defaultValues: {
            task: initialTask || "",
            notes: "",
            equipment_id: "",
            frequency: "once",
            custom_frequency: "",
            volume_changed: null,
        },
    });

    const watchedTask = form.watch("task");
    const watchedFrequency = form.watch("frequency");
    const [recommendedVolume, setRecommendedVolume] = React.useState<number | null>(null);

    React.useEffect(() => {
        if (watchedTask && aquariumSize != null && watchedTask.toLowerCase().includes('water change')) {
            let percentage = 25; // Default percentage
            const percentageMatch = watchedTask.match(/(\d+)%/);
            if (percentageMatch) {
                percentage = parseInt(percentageMatch[1], 10);
            }
            
            const recommendation = (aquariumSize * percentage) / 100;
            setRecommendedVolume(recommendation);
        } else {
            setRecommendedVolume(null);
        }
    }, [watchedTask, aquariumSize]);

    async function onSubmit(values: z.infer<typeof maintenanceTaskSchema>) {
        if (!user) {
            toast({ title: "Error", description: "You must be logged in to add a task.", variant: "destructive" });
            return;
        }

        if (values.volume_changed) {
            console.log("Captured water change volume (gallons):", values.volume_changed);
            toast({ title: "Info", description: `Water change volume of ${values.volume_changed} gal captured. This is not yet saved to the database.`, duration: 5000 });
        }

        let finalEquipmentId: string | null = null;
        if (values.equipment_id) {
            const isExisting = equipmentList?.some(eq => eq.id === values.equipment_id);
            if (isExisting) {
                finalEquipmentId = values.equipment_id;
            } else {
                try {
                    const { data: newEquipment, error: insertError } = await supabase
                        .from('equipment')
                        .insert({
                            aquarium_id: aquariumId,
                            user_id: user.id,
                            type: values.equipment_id,
                        })
                        .select('id')
                        .single();
                    
                    if (insertError) throw insertError;
                    
                    finalEquipmentId = newEquipment.id;
                    queryClient.invalidateQueries({ queryKey: ['equipmentForSelect', aquariumId] });
                } catch (error: any) {
                    toast({ title: "Error adding new equipment", description: error.message, variant: "destructive" });
                    return;
                }
            }
        }

        const finalFrequency = values.frequency === 'custom' ? values.custom_frequency : values.frequency;

        const newMaintenanceTask: TablesInsert<'maintenance'> = {
            aquarium_id: aquariumId,
            user_id: user.id,
            task: values.task,
            notes: values.notes || null,
            due_date: values.due_date ? values.due_date.toISOString() : null,
            equipment_id: finalEquipmentId,
            frequency: finalFrequency === 'once' ? null : finalFrequency,
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
                        <FormItem className="flex flex-col">
                            <FormLabel>Task</FormLabel>
                            <TaskCombobox
                                field={field}
                                form={form}
                                options={maintenanceTaskOptions}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="equipment_id"
                    render={({ field }) => (
                         <FormItem className="flex flex-col">
                            <FormLabel>Related Equipment (Optional)</FormLabel>
                            <EquipmentCombobox
                                field={field}
                                form={form}
                                options={equipmentOptions}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {watchedTask && watchedTask.toLowerCase().includes('water change') && aquariumSize != null && (
                    <div className="space-y-2 rounded-md border p-4 bg-accent/50 border-border">
                        {recommendedVolume !== null ? (
                            <p className="text-sm text-muted-foreground">
                                Recommended water change: <strong>{recommendedVolume.toFixed(1)} gallons</strong> (for a {aquariumSize} gallon tank).
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                This is a {aquariumSize} gallon tank. Consider specifying a percentage for water changes (e.g., "Water Change 25%").
                            </p>
                        )}
                        <FormField
                            control={form.control}
                            name="volume_changed"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Actual Water Changed (gallons)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="e.g., 5"
                                            {...field}
                                            value={field.value ?? ''}
                                            onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Frequency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {frequencyOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {watchedFrequency === "custom" && (
                    <FormField
                        control={form.control}
                        name="custom_frequency"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Custom Frequency</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., every 3 weeks, bi-weekly, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

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
