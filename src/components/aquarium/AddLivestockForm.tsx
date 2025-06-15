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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

const livestockFormSchema = z.object({
  species: z.string().min(1, "Species is required."),
  name: z.string().optional(),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  added_at: z.date({ required_error: "Date added is required."}),
  notes: z.string().optional(),
});

const freshwaterSpecies = [
    "Neon Tetra", "Cardinal Tetra", "Guppy", "Molly", "Platy", "Swordtail", "Betta", 
    "Angelfish", "Discus", "Corydoras Catfish", "Otocinclus", "Bristlenose Pleco",
    "Cherry Barb", "Tiger Barb", "Zebra Danio", "White Cloud Mountain Minnow",
    "Harlequin Rasbora", "Other"
];

const plantedFreshwaterSpecies = [
    "Neon Tetra", "Cardinal Tetra", "Rummy Nose Tetra", "Harlequin Rasbora", 
    "Otocinclus", "Siamese Algae Eater", "Corydoras Catfish", "Cherry Shrimp", 
    "Amano Shrimp", "Crystal Red Shrimp", "Java Moss", "Anubias", "Amazon Sword", 
    "Vallisneria", "Cryptocoryne", "Rotala", "Ludwigia", "Other"
];

const freshwaterInvertSpecies = [
    "Cherry Shrimp", "Crystal Red Shrimp", "Crystal Black Shrimp", "Amano Shrimp", 
    "Ghost Shrimp", "Bamboo Shrimp", "Vampire Shrimp", "Nerite Snail", "Mystery Snail", 
    "Ramshorn Snail", "Malaysian Trumpet Snail", "Assassin Snail", "Other"
];

const saltwaterFishOnlySpecies = [
    "Clownfish", "Blue Tang", "Yellow Tang", "Royal Gramma", "Cardinalfish",
    "Goby", "Wrasse", "Anthias", "Dottyback", "Blenny", "Mandarin Fish",
    "Triggerfish", "Angelfish", "Butterflyfish", "Grouper", "Other"
];

const fowlrSpecies = [
    "Clownfish", "Blue Tang", "Yellow Tang", "Royal Gramma", "Cardinalfish",
    "Goby", "Wrasse", "Anthias", "Dottyback", "Blenny", "Mandarin Fish",
    "Cleaner Shrimp", "Fire Shrimp", "Hermit Crab", "Turbo Snail",
    "Nassarius Snail", "Conch", "Sea Urchin", "Other"
];

const softCoralReefSpecies = [
    "Clownfish", "Royal Gramma", "Cardinalfish", "Goby", "Wrasse", "Anthias",
    "Dottyback", "Cleaner Shrimp", "Fire Shrimp", "Hermit Crab", "Turbo Snail",
    "Zoanthid Coral", "Mushroom Coral", "Kenya Tree Coral", "Toadstool Coral",
    "Star Polyp", "Xenia", "Other"
];

const mixedReefSpecies = [
    "Clownfish", "Royal Gramma", "Cardinalfish", "Goby", "Wrasse", "Anthias",
    "Dottyback", "Cleaner Shrimp", "Fire Shrimp", "Hermit Crab", "Turbo Snail",
    "Zoanthid Coral", "Mushroom Coral", "Hammer Coral", "Torch Coral",
    "Frogspawn", "Brain Coral", "Acan Coral", "Chalice Coral", "Other"
];

const spsReefSpecies = [
    "Clownfish", "Royal Gramma", "Cardinalfish", "Goby", "Wrasse", "Anthias",
    "Dottyback", "Cleaner Shrimp", "Fire Shrimp", "Hermit Crab", "Turbo Snail",
    "Acropora", "Montipora", "Staghorn Coral", "Table Coral", "Bird's Nest Coral",
    "Millepora", "Stylophora", "Seriatopora", "Other"
];

type LivestockFormValues = z.infer<typeof livestockFormSchema>;

interface AddLivestockFormProps {
  aquariumId: string;
  aquariumType: string | null;
  onSuccess: () => void;
}

export function AddLivestockForm({ aquariumId, aquariumType, onSuccess }: AddLivestockFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const getSpeciesOptions = () => {
    switch (aquariumType) {
      case "Freshwater":
        return freshwaterSpecies;
      case "Planted Freshwater":
        return plantedFreshwaterSpecies;
      case "Freshwater Invertebrates":
        return freshwaterInvertSpecies;
      case "Saltwater Fish-Only (FO)":
        return saltwaterFishOnlySpecies;
      case "Fish-Only with Live Rock (FOWLR)":
        return fowlrSpecies;
      case "Soft Coral Reef":
        return softCoralReefSpecies;
      case "Mixed Reef (LPS + Soft)":
        return mixedReefSpecies;
      case "SPS Reef (Hard Coral)":
        return spsReefSpecies;
      default:
        return [...freshwaterSpecies, ...saltwaterFishOnlySpecies];
    }
  };

  const speciesOptions = getSpeciesOptions();

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
            <FormItem className="flex flex-col">
              <FormLabel>Species</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value || "Select a species..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search species..." />
                    <CommandList>
                      <CommandEmpty>No species found.</CommandEmpty>
                      <CommandGroup>
                        {speciesOptions.map((species) => (
                          <CommandItem
                            key={species}
                            value={species}
                            onSelect={() => {
                              form.setValue("species", species);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === species ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {species}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
