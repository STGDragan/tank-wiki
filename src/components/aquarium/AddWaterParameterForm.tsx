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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const numberOrEmptyToUndefined = z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.number().optional().nullable()
);

const waterParametersFormSchema = z.object({
  recorded_at: z.date({ required_error: "Date is required." }),
  temperature: numberOrEmptyToUndefined,
  ph: numberOrEmptyToUndefined,
  ammonia: numberOrEmptyToUndefined,
  nitrite: numberOrEmptyToUndefined,
  nitrate: numberOrEmptyToUndefined,
  salinity: numberOrEmptyToUndefined,
  alkalinity: numberOrEmptyToUndefined,
  calcium: numberOrEmptyToUndefined,
  magnesium: numberOrEmptyToUndefined,
  gh: numberOrEmptyToUndefined,
  kh: numberOrEmptyToUndefined,
  co2: numberOrEmptyToUndefined,
  phosphate: numberOrEmptyToUndefined,
  copper: numberOrEmptyToUndefined,
});

type WaterParametersFormValues = z.infer<typeof waterParametersFormSchema>;

interface AddWaterParameterFormProps {
  aquariumId: string;
  aquariumType: string | null;
  onSuccess: () => void;
}

export function AddWaterParameterForm({ aquariumId, aquariumType, onSuccess }: AddWaterParameterFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<WaterParametersFormValues>({
    resolver: zodResolver(waterParametersFormSchema),
    defaultValues: {
      recorded_at: new Date(),
      temperature: null,
      ph: null,
      ammonia: null,
      nitrite: null,
      nitrate: null,
      salinity: null,
      alkalinity: null,
      calcium: null,
      magnesium: null,
      gh: null,
      kh: null,
      co2: null,
      phosphate: null,
      copper: null,
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: WaterParametersFormValues) {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to add parameters.", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("water_parameters").insert({
      aquarium_id: aquariumId,
      user_id: user.id,
      recorded_at: values.recorded_at.toISOString(),
      temperature: values.temperature ?? null,
      ph: values.ph ?? null,
      ammonia: values.ammonia ?? null,
      nitrite: values.nitrite ?? null,
      nitrate: values.nitrate ?? null,
      salinity: values.salinity ?? null,
      alkalinity: values.alkalinity ?? null,
      calcium: values.calcium ?? null,
      magnesium: values.magnesium ?? null,
      gh: values.gh ?? null,
      kh: values.kh ?? null,
      co2: values.co2 ?? null,
      phosphate: values.phosphate ?? null,
      copper: values.copper ?? null,
    });

    if (error) {
      toast({ title: "Error adding water parameters", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Water parameters added successfully." });
      await queryClient.invalidateQueries({ queryKey: ['water_parameters', aquariumId] });
      await queryClient.invalidateQueries({ queryKey: ['health-ranking-data', aquariumId] });
      onSuccess();
    }
  }

  const isSaltwater = aquariumType?.toLowerCase().includes('saltwater');
  const isFreshwater = !isSaltwater;
  const isPlanted = aquariumType === 'Planted Freshwater Tank';
  const isInverts = aquariumType === 'Freshwater Inverts';
  const isReef = ['Saltwater Softy Reef', 'Saltwater Mixed Reef', 'Saltwater SPS Reef'].includes(aquariumType || '');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperature (°F)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ph"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>pH</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ammonia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ammonia (ppm)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nitrite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nitrite (ppm)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nitrate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nitrate (ppm)</FormLabel>
                  <FormControl>
                    <Input type="number" step="1" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {isFreshwater && (
                <>
                    <FormField
                      control={form.control}
                      name="gh"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>General Hardness (dGH)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="kh"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Carbonate Hardness (dKH)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </>
            )}
            
            {isPlanted && (
                <FormField
                  control={form.control}
                  name="co2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CO2 (ppm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            )}

            {isInverts && (
                <FormField
                  control={form.control}
                  name="copper"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Copper (ppm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            )}

            {isSaltwater && (
                <>
                    <FormField
                      control={form.control}
                      name="salinity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salinity (ppt)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="alkalinity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alkalinity (dKH)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="calcium"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calcium (ppm)</FormLabel>
                          <FormControl>
                            <Input type="number" step="1" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="magnesium"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Magnesium (ppm)</FormLabel>
                          <FormControl>
                            <Input type="number" step="1" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </>
            )}

            {isReef && (
                <FormField
                  control={form.control}
                  name="phosphate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phosphate (ppm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            )}
        </div>

        <FormField
            control={form.control}
            name="recorded_at"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date Recorded</FormLabel>
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

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Adding..." : "Add Reading"}
        </Button>
      </form>
    </Form>
  );
}
