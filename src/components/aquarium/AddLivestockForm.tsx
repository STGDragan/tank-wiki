
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CustomizableLivestockTypeSelector } from "./CustomizableLivestockTypeSelector";
import { SpeciesCombobox } from "./species-selector/SpeciesCombobox";
import { getAllSpecies, getCategorizedSpecies } from "@/data/species";

const livestockFormSchema = z.object({
  type: z.string().min(1, "Type is required."),
  species: z.string().min(1, "Species is required."),
  name: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1."),
  notes: z.string().optional(),
});

type LivestockFormValues = z.infer<typeof livestockFormSchema>;

interface AddLivestockFormProps {
  aquariumId: string;
  aquariumType?: string | null;
  onSuccess: () => void;
}

export function AddLivestockForm({ aquariumId, aquariumType, onSuccess }: AddLivestockFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<LivestockFormValues>({
    resolver: zodResolver(livestockFormSchema),
    defaultValues: {
      type: "",
      species: "",
      name: "",
      quantity: 1,
      notes: "",
    },
  });

  const { isSubmitting } = form.formState;
  const allSpecies = getAllSpecies();
  const categorizedSpecies = getCategorizedSpecies();

  async function onSubmit(values: LivestockFormValues) {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to add livestock.", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("livestock").insert({
      aquarium_id: aquariumId,
      user_id: user.id,
      type: values.type,
      species: values.species,
      name: values.name || null,
      quantity: values.quantity,
      notes: values.notes || null,
    });

    if (error) {
      toast({ title: "Error adding livestock", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Livestock added successfully." });
    await queryClient.invalidateQueries({ queryKey: ['livestock', aquariumId] });
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
              <CustomizableLivestockTypeSelector
                value={field.value}
                onChange={field.onChange}
                label="Type"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="species"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-display text-primary">Species</FormLabel>
              <FormControl>
                <SpeciesCombobox
                  value={field.value}
                  onChange={field.onChange}
                  allSpecies={allSpecies}
                  categorizedSpecies={categorizedSpecies}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-display text-primary">Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Give your livestock a name..." {...field} className="cyber-input" />
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
              <FormLabel className="font-display text-primary">Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  className="cyber-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-display text-primary">Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Any additional details..." {...field} className="cyber-input" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full btn-primary">
          {isSubmitting ? "Adding..." : "Add Livestock"}
        </Button>
      </form>
    </Form>
  );
}
