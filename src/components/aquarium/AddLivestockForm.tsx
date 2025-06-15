import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const livestockFormSchema = z.object({
  species: z.string().min(1, "Species is required."),
  name: z.string().optional(),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  added_at: z.date({ required_error: "Date added is required."}),
  notes: z.string().optional(),
});

const speciesOptions = [
    "Clownfish", "Royal Gramma", "Neon Tetra", "Guppy", "Betta", "Angelfish", "Discus",
    "Amano Shrimp", "Cherry Shrimp", "Nerite Snail", "Mystery Snail",
    "Zoanthid Coral", "Mushroom Coral", "Hammer Coral",
    "Other"
];

type LivestockFormValues = z.infer<typeof livestockFormSchema>;

interface AddLivestockFormProps {
  aquariumId: string;
  onSuccess: () => void;
}

export function AddLivestockForm({ aquariumId, onSuccess }: AddLivestockFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<LivestockFormValues>({
    resolver: zodResolver(livestockFormSchema),
    defaultValues: {
      species: "",
      name: "",
      quantity: 1,
      added_at: new Date(),
      notes: "",
    },
  });

  const { isSubmitting } = form.formState;

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
          name="species"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Species</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a species" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                      {speciesOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              <FormMessage />
            </FormItem>
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
              <FormItem className="flex flex-col">
                <FormLabel>Date Added</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal justify-start",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
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
