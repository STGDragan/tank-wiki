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
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import React, { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const maintenanceTaskSchema = z.object({
  task: z.string().min(1, "Task description is required."),
  notes: z.string().optional(),
  due_date: z.date().optional(),
  equipment_id: z.string().optional(),
  frequency: z.string().optional(),
});

type Equipment = Pick<Tables<'equipment'>, 'id' | 'type' | 'brand' | 'model'>;

const commonEquipmentData = {
  freshwater: [
    "Filter", "Heater", "Air Pump", "Light", "Substrate", "Thermometer", "Water Conditioner", "Fish Net",
  ],
  saltwater: [
    "Protein Skimmer", "RO/DI Unit", "Wave Maker", "Sump", "Refugium Light", "Dosing Pump", "Auto Top Off (ATO)", "Reactor",
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

export const AddMaintenanceTaskForm = ({ aquariumId, onSuccess, aquariumType }: { aquariumId: string, onSuccess: () => void, aquariumType: string | null }) => {
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

        const tankTypeKey = aquariumType === 'saltwater' ? 'saltwater' : 'freshwater';
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
            task: "",
            notes: "",
            equipment_id: "",
            frequency: "once",
        },
    });

    async function onSubmit(values: z.infer<typeof maintenanceTaskSchema>) {
        if (!user) {
            toast({ title: "Error", description: "You must be logged in to add a task.", variant: "destructive" });
            return;
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

        const newMaintenanceTask: TablesInsert<'maintenance'> = {
            aquarium_id: aquariumId,
            user_id: user.id,
            task: values.task,
            notes: values.notes || null,
            due_date: values.due_date ? values.due_date.toISOString() : null,
            equipment_id: finalEquipmentId,
            frequency: values.frequency === 'once' ? null : values.frequency,
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
                    render={({ field }) => {
                        const [open, setOpen] = useState(false);
                        return (
                            <FormItem className="flex flex-col">
                                <FormLabel>Task</FormLabel>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "w-full justify-between",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value || "Select a task or type a new one"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command filter={(value, search) => value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0}>
                                            <CommandInput
                                                placeholder="Search or add new task..."
                                                value={field.value || ''}
                                                onValueChange={field.onChange}
                                            />
                                            <CommandList>
                                                <CommandEmpty>No task found. The new task will be created.</CommandEmpty>
                                                <CommandGroup>
                                                    {maintenanceTaskOptions.map((option) => (
                                                        <CommandItem
                                                            key={option.value}
                                                            value={option.value}
                                                            onSelect={(selectedValue) => {
                                                                form.setValue("task", selectedValue);
                                                                setOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    field.value === option.value ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {option.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )
                    }}
                />
                
                <FormField
                    control={form.control}
                    name="equipment_id"
                    render={({ field }) => {
                        const [open, setOpen] = useState(false);
                        const selectedValue = equipmentOptions.find(option => option.value === field.value);
                        return (
                            <FormItem className="flex flex-col">
                                <FormLabel>Related Equipment (Optional)</FormLabel>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "w-full justify-between",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {selectedValue?.label || field.value || "Select or type equipment"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command filter={(value, search) => {
                                            const option = equipmentOptions.find(opt => opt.value === value);
                                            if (option?.label.toLowerCase().includes(search.toLowerCase())) return 1;
                                            return 0;
                                        }}>
                                            <CommandInput
                                                placeholder="Search or add new equipment..."
                                                value={field.value}
                                                onValueChange={(search) => {
                                                   const match = equipmentOptions.find(opt => opt.value === search);
                                                   if (match) {
                                                       field.onChange(search);
                                                   } else {
                                                       field.onChange(search);
                                                   }
                                                }}
                                            />
                                            <CommandList>
                                                <CommandEmpty>No equipment found. A new one will be created.</CommandEmpty>
                                                <CommandGroup>
                                                    {equipmentOptions.map((option) => (
                                                        <CommandItem
                                                            key={option.value}
                                                            value={option.value}
                                                            onSelect={(currentValue) => {
                                                                form.setValue("equipment_id", currentValue === field.value ? "" : currentValue);
                                                                setOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    field.value === option.value ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {option.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )
                    }}
                />

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
