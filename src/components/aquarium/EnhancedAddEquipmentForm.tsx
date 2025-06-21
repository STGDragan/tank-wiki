
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateSelector } from "./DateSelector";
import { equipmentDefaults } from "@/data/equipment/equipmentDefaults";
import { consumableTypes } from "@/data/equipment/consumables";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const equipmentFormSchema = z.object({
  type: z.string().min(1, "Equipment type is required."),
  brand: z.string().min(1, "Brand is required."),
  model: z.string().optional(),
  installed_at: z.date().optional(),
  notes: z.string().optional(),
  consumables: z.array(z.object({
    name: z.string(),
    frequency: z.string(),
  })).optional(),
});

type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

interface EnhancedAddEquipmentFormProps {
  aquariumId: string;
  onSuccess: () => void;
}

export function EnhancedAddEquipmentForm({ aquariumId, onSuccess }: EnhancedAddEquipmentFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConsumables, setSelectedConsumables] = useState<string[]>([]);
  const [customBrand, setCustomBrand] = useState("");
  const [customModel, setCustomModel] = useState("");

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      type: "",
      brand: "",
      model: "",
      installed_at: new Date(),
      notes: "",
      consumables: [],
    },
  });

  const { isSubmitting } = form.formState;
  const watchedType = form.watch("type");
  const watchedBrand = form.watch("brand");

  const currentEquipmentDefault = equipmentDefaults.find(eq => eq.type === watchedType);
  const currentBrandDefault = currentEquipmentDefault?.brands.find(brand => brand.name === watchedBrand);
  const compatibleConsumables = consumableTypes.filter(consumable => 
    consumable.compatibleEquipment.includes(watchedType)
  );

  const handleBrandChange = (brand: string) => {
    form.setValue("brand", brand);
    form.setValue("model", "");
    if (brand === "Other") {
      setCustomBrand("");
    }
  };

  const handleConsumableToggle = (consumableName: string) => {
    setSelectedConsumables(prev => 
      prev.includes(consumableName) 
        ? prev.filter(name => name !== consumableName)
        : [...prev, consumableName]
    );
  };

  async function onSubmit(values: EquipmentFormValues) {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to add equipment.", variant: "destructive" });
      return;
    }

    const finalBrand = values.brand === "Other" ? customBrand : values.brand;
    const finalModel = values.brand === "Other" ? customModel : values.model;

    // Insert equipment
    const { data: equipment, error: equipmentError } = await supabase
      .from("equipment")
      .insert({
        aquarium_id: aquariumId,
        user_id: user.id,
        type: values.type,
        brand: finalBrand,
        model: finalModel || null,
        installed_at: values.installed_at ? values.installed_at.toISOString().split('T')[0] : null,
        notes: values.notes || null,
      })
      .select()
      .single();

    if (equipmentError) {
      toast({ title: "Error adding equipment", description: equipmentError.message, variant: "destructive" });
      return;
    }

    // Create maintenance tasks for selected consumables
    if (selectedConsumables.length > 0 && equipment) {
      const maintenanceTasks = selectedConsumables.map(consumableName => {
        const consumable = consumableTypes.find(c => c.name === consumableName);
        const defaultFrequency = consumable?.maintenanceFrequency[0] || "monthly";
        
        // Calculate next due date based on frequency
        const dueDate = new Date();
        switch (defaultFrequency) {
          case "weekly":
            dueDate.setDate(dueDate.getDate() + 7);
            break;
          case "every 2 weeks":
            dueDate.setDate(dueDate.getDate() + 14);
            break;
          case "monthly":
            dueDate.setMonth(dueDate.getMonth() + 1);
            break;
          case "every 2 months":
            dueDate.setMonth(dueDate.getMonth() + 2);
            break;
          case "every 3 months":
            dueDate.setMonth(dueDate.getMonth() + 3);
            break;
          case "every 6 months":
            dueDate.setMonth(dueDate.getMonth() + 6);
            break;
          case "annually":
            dueDate.setFullYear(dueDate.getFullYear() + 1);
            break;
          default:
            dueDate.setMonth(dueDate.getMonth() + 1);
        }

        return {
          aquarium_id: aquariumId,
          user_id: user.id,
          equipment_id: equipment.id,
          task: `Replace ${consumableName}`,
          due_date: dueDate.toISOString().split('T')[0],
          frequency: defaultFrequency,
          notes: `Scheduled maintenance for ${finalBrand} ${finalModel || values.type}`,
        };
      });

      const { error: maintenanceError } = await supabase
        .from("maintenance")
        .insert(maintenanceTasks);

      if (maintenanceError) {
        console.warn("Error creating maintenance tasks:", maintenanceError);
        // Don't fail the whole operation for maintenance task errors
      }
    }

    toast({ title: "Success", description: "Equipment added successfully with maintenance schedule." });
    await queryClient.invalidateQueries({ queryKey: ['equipment', aquariumId] });
    await queryClient.invalidateQueries({ queryKey: ['maintenance', aquariumId] });
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipment Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment type..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {equipmentDefaults.map((equipment) => (
                    <SelectItem key={equipment.type} value={equipment.type}>
                      {equipment.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {currentEquipmentDefault && (
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <Select onValueChange={handleBrandChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currentEquipmentDefault.brands.map((brand) => (
                      <SelectItem key={brand.name} value={brand.name}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {watchedBrand === "Other" && (
          <FormItem>
            <FormLabel>Custom Brand</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter brand name..."
                value={customBrand}
                onChange={(e) => setCustomBrand(e.target.value)}
              />
            </FormControl>
          </FormItem>
        )}

        {currentBrandDefault && currentBrandDefault.models.length > 0 && (
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currentBrandDefault.models.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {watchedBrand === "Other" && (
          <FormItem>
            <FormLabel>Custom Model</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter model name..."
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
              />
            </FormControl>
          </FormItem>
        )}

        <FormField
          control={form.control}
          name="installed_at"
          render={({ field }) => (
            <DateSelector
              value={field.value}
              onChange={field.onChange}
              label="Installation Date (Optional)"
              placeholder="When was this installed?"
            />
          )}
        />

        {compatibleConsumables.length > 0 && (
          <div className="space-y-3">
            <FormLabel>Consumables & Maintenance Items</FormLabel>
            <p className="text-sm text-muted-foreground">
              Select items that need regular replacement/maintenance:
            </p>
            <div className="space-y-2">
              {compatibleConsumables.map((consumable) => (
                <div key={consumable.name} className="flex items-center space-x-2">
                  <Checkbox 
                    id={consumable.name}
                    checked={selectedConsumables.includes(consumable.name)}
                    onCheckedChange={() => handleConsumableToggle(consumable.name)}
                  />
                  <Label htmlFor={consumable.name} className="text-sm">
                    {consumable.name} 
                    <span className="text-muted-foreground ml-2">
                      (typically {consumable.maintenanceFrequency[0]})
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Any additional details..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Adding..." : "Add Equipment"}
        </Button>
      </form>
    </Form>
  );
}
