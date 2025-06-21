
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
import { DateSelector } from "./DateSelector";
import { LivestockTypeSelector } from "./LivestockTypeSelector";
import { CascadingSpeciesSelector } from "./CascadingSpeciesSelector";
import { useState } from "react";

const livestockFormSchema = z.object({
  livestockType: z.string().min(1, "Livestock type is required."),
  species: z.string().min(1, "Species is required."),
  name: z.string().optional(),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  added_at: z.date({ required_error: "Date added is required."}),
  notes: z.string().optional(),
});

type LivestockFormValues = z.infer<typeof livestockFormSchema>;

interface AddLivestockFormProps {
  aquariumId: string;
  aquariumType: string | null;
  onSuccess: () => void;
  initialData?: Partial<LivestockFormValues>;
}

export function AddLivestockForm({ 
  aquariumId, 
  aquariumType, 
  onSuccess, 
  initialData 
}: AddLivestockFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<LivestockFormValues>({
    resolver: zodResolver(livestockFormSchema),
    defaultValues: {
      livestockType: initialData?.livestockType || "",
      species: initialData?.species || "",
      name: initialData?.name || "",
      quantity: initialData?.quantity || 1,
      added_at: initialData?.added_at || new Date(),
      notes: initialData?.notes || "",
    },
  });

  const { isSubmitting } = form.formState;
  const watchedLivestockType = form.watch("livestockType");

  // Reset species when livestock type changes
  const handleLivestockTypeChange = (type: string) => {
    form.setValue("livestockType", type);
    form.setValue("species", "");
  };

  async function onSubmit(values: LivestockFormValues) {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to add livestock.", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("livestock").insert({
      aquarium_id: aquariumId,
      user_id: user.id,
      species: values.species,
      name: values.name || null,
      quantity: values.quantity,
      notes: values.notes || null,
      added_at: values.added_at.toISOString(),
    });

    if (error) {
      toast({ title: "Error adding livestock", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Livestock added successfully." });
      await queryClient.invalidateQueries({ queryKey: ['livestock', aquariumId] });
      onSuccess();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="livestockType"
          render={({ field }) => (
            <LivestockTypeSelector
              value={field.value}
              onChange={handleLivestockTypeChange}
              aquariumType={aquariumType}
            />
          )}
        />

        <FormField
          control={form.control}
          name="species"
          render={({ field }) => (
            <CascadingSpeciesSelector
              value={field.value}
              onChange={field.onChange}
              livestockType={watchedLivestockType}
              aquariumType={aquariumType}
            />
          )}
        />
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Nemo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="added_at"
          render={({ field }) => (
            <DateSelector
              value={field.value}
              onChange={field.onChange}
              label="Date Added"
            />
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Any extra details..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Adding..." : "Add Livestock"}
        </Button>
      </form>
    </Form>
  );
}
