
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
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { equipmentDefaults } from "@/data/equipment/equipmentDefaults";
import { consumableTypes } from "@/data/equipment/consumables";

const maintenanceTaskSchema = z.object({
  equipment_id: z.string().min(1, "Please select equipment first."),
  task: z.string().min(1, "Task description is required."),
  notes: z.string().optional(),
  due_date: z.date().optional(),
  frequency: z.string().optional(),
  custom_frequency: z.string().optional(),
  volume_changed: z.coerce.number({ invalid_type_error: "Please enter a valid number." }).optional().nullable(),
});

type Equipment = Pick<Tables<'equipment'>, 'id' | 'type' | 'brand' | 'model'>;

const frequencyOptions = [
  { value: "once", label: "Once" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "every 2 weeks", label: "Every 2 Weeks" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom" },
];

const getTaskSuggestions = (equipmentType: string) => {
  const commonTasks: Record<string, string[]> = {
    Filter: ["Clean filter media", "Replace filter cartridge", "Replace carbon media", "Clean impeller", "Check O-rings"],
    Heater: ["Check temperature accuracy", "Clean heater", "Inspect power cord"],
    Light: ["Replace LED array", "Clean light fixture", "Check timer settings"],
    Powerhead: ["Clean impeller", "Check flow rate", "Lubricate motor"],
    "Protein Skimmer": ["Empty collection cup", "Clean skimmer neck", "Replace air stone", "Check pump"],
    "UV Sterilizer": ["Replace UV bulb", "Clean quartz sleeve", "Check flow rate"],
  };
  
  return commonTasks[equipmentType] || ["General maintenance", "Clean equipment", "Inspect for wear"];
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

export const EquipmentBasedMaintenanceForm = ({ 
  aquariumId, 
  onSuccess, 
  aquariumType, 
  aquariumSize 
}: { 
  aquariumId: string, 
  onSuccess: () => void, 
  aquariumType: string | null, 
  aquariumSize?: number | null 
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedEquipmentType, setSelectedEquipmentType] = useState<string>("");
  
  const { data: equipmentList } = useQuery({
    queryKey: ['equipmentForSelect', aquariumId],
    queryFn: () => fetchEquipmentForSelect(aquariumId),
    enabled: !!aquariumId,
  });

  const form = useForm<z.infer<typeof maintenanceTaskSchema>>({
    resolver: zodResolver(maintenanceTaskSchema),
    defaultValues: {
      equipment_id: "",
      task: "",
      notes: "",
      frequency: "once",
      custom_frequency: "",
      volume_changed: null,
    },
  });

  const watchedEquipmentId = form.watch("equipment_id");
  const watchedFrequency = form.watch("frequency");
  const watchedTask = form.watch("task");

  React.useEffect(() => {
    if (watchedEquipmentId) {
      const equipment = equipmentList?.find(eq => eq.id === watchedEquipmentId);
      if (equipment) {
        setSelectedEquipmentType(equipment.type);
      }
    }
  }, [watchedEquipmentId, equipmentList]);

  const taskSuggestions = selectedEquipmentType ? getTaskSuggestions(selectedEquipmentType) : [];
  const compatibleConsumables = selectedEquipmentType 
    ? consumableTypes.filter(c => c.compatibleEquipment.includes(selectedEquipmentType))
    : [];

  const [recommendedVolume, setRecommendedVolume] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (watchedTask && aquariumSize != null && watchedTask.toLowerCase().includes('water change')) {
      let percentage = 25;
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

    const finalFrequency = values.frequency === 'custom' ? values.custom_frequency : values.frequency;

    const newMaintenanceTask: TablesInsert<'maintenance'> = {
      aquarium_id: aquariumId,
      user_id: user.id,
      task: values.task,
      notes: values.notes || null,
      due_date: values.due_date ? values.due_date.toISOString() : null,
      equipment_id: values.equipment_id,
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
          name="equipment_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Equipment First</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose equipment..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {equipmentList?.map((equipment) => (
                    <SelectItem key={equipment.id} value={equipment.id}>
                      {equipment.type} {equipment.brand && `(${equipment.brand} ${equipment.model || ''})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedEquipmentType && compatibleConsumables.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Related Consumables for {selectedEquipmentType}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {compatibleConsumables.map((consumable, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{consumable.name}</span>
                  <div className="flex gap-1">
                    {consumable.maintenanceFrequency.map((freq, freqIndex) => (
                      <Badge key={freqIndex} variant="outline" className="text-xs">
                        {freq}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {selectedEquipmentType && (
          <FormField
            control={form.control}
            name="task"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maintenance Task</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select or type a task..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {taskSuggestions.map((task, index) => (
                      <SelectItem key={index} value={task}>
                        {task}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">Other (Custom Task)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {watchedTask === "other" && (
          <FormField
            control={form.control}
            name="task"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Task Description</FormLabel>
                <FormControl>
                  <Input placeholder="Enter custom task..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {watchedTask && watchedTask.toLowerCase().includes('water change') && aquariumSize != null && (
          <div className="space-y-2 rounded-md border p-4 bg-accent/50 border-border">
            {recommendedVolume !== null ? (
              <p className="text-sm text-muted-foreground">
                Recommended water change: <strong>{recommendedVolume.toFixed(1)} gallons</strong> (for a {aquariumSize} gallon tank).
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                This is a {aquariumSize} gallon tank. Consider specifying a percentage for water changes.
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
