
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon } from "lucide-react";
import { IdealRangeDisplay } from "./WaterParameterIdealRanges";

const numberOrEmptyToDefault = z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.coerce.number().min(0).nullable()
);

const waterParametersFormSchema = z.object({
  recorded_at: z.date({ required_error: "Date is required." }),
  temperature: numberOrEmptyToDefault,
  ph: numberOrEmptyToDefault,
  ammonia: numberOrEmptyToDefault,
  nitrite: numberOrEmptyToDefault,
  nitrate: numberOrEmptyToDefault,
  salinity: numberOrEmptyToDefault,
  alkalinity: numberOrEmptyToDefault,
  calcium: numberOrEmptyToDefault,
  magnesium: numberOrEmptyToDefault,
  gh: numberOrEmptyToDefault,
  kh: numberOrEmptyToDefault,
  co2: numberOrEmptyToDefault,
  phosphate: numberOrEmptyToDefault,
  copper: numberOrEmptyToDefault,
});

type WaterParametersFormValues = z.infer<typeof waterParametersFormSchema>;

interface AddWaterParameterFormProps {
  aquariumId: string;
  aquariumType: string | null;
  onSuccess: () => void;
}

// Fetch most recent water parameters for auto-population
const fetchLatestWaterParameters = async (aquariumId: string) => {
  const { data, error } = await supabase
    .from('water_parameters')
    .select('*')
    .eq('aquarium_id', aquariumId)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }
  return data;
};

export function AddWaterParameterForm({ aquariumId, aquariumType, onSuccess }: AddWaterParameterFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch latest parameters for auto-population
  const { data: latestParams } = useQuery({
    queryKey: ['latest-water-parameters', aquariumId],
    queryFn: () => fetchLatestWaterParameters(aquariumId),
    enabled: !!aquariumId,
  });

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

  // Update form defaults when latest params are loaded
  React.useEffect(() => {
    if (latestParams) {
      form.reset({
        recorded_at: new Date(),
        temperature: latestParams.temperature,
        ph: latestParams.ph,
        ammonia: latestParams.ammonia,
        nitrite: latestParams.nitrite,
        nitrate: latestParams.nitrate,
        salinity: latestParams.salinity,
        alkalinity: latestParams.alkalinity,
        calcium: latestParams.calcium,
        magnesium: latestParams.magnesium,
        gh: latestParams.gh,
        kh: latestParams.kh,
        co2: latestParams.co2,
        phosphate: latestParams.phosphate,
        copper: latestParams.copper,
      });
    }
  }, [latestParams, form]);

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
      temperature: values.temperature,
      ph: values.ph,
      ammonia: values.ammonia,
      nitrite: values.nitrite,
      nitrate: values.nitrate,
      salinity: values.salinity,
      alkalinity: values.alkalinity,
      calcium: values.calcium,
      magnesium: values.magnesium,
      gh: values.gh,
      kh: values.kh,
      co2: values.co2,
      phosphate: values.phosphate,
      copper: values.copper,
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

  const isFreshwater = aquariumType === "Freshwater";
  const isPlantedFreshwater = aquariumType === "Planted Freshwater";
  const isFreshwaterInverts = aquariumType === "Freshwater Invertebrates";
  const isSaltwaterFO = aquariumType === "Saltwater Fish-Only (FO)";
  const isFOWLR = aquariumType === "Fish-Only with Live Rock (FOWLR)";
  const isSoftReef = aquariumType === "Soft Coral Reef";
  const isMixedReef = aquariumType === "Mixed Reef (LPS + Soft)";
  const isSPSReef = aquariumType === "SPS Reef (Hard Coral)";
  
  const isSaltwater = isSaltwaterFO || isFOWLR || isSoftReef || isMixedReef || isSPSReef;
  const isReef = isSoftReef || isMixedReef || isSPSReef;

  return (
    <ScrollArea className="h-[70vh] pr-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      Temperature (°F)
                      <IdealRangeDisplay parameter="temperature" aquariumType={aquariumType} />
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1" 
                        {...field} 
                        value={field.value ?? ""} 
                        className="bg-background border-input" 
                      />
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
                    <FormLabel className="flex items-center">
                      pH
                      <IdealRangeDisplay parameter="ph" aquariumType={aquariumType} />
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1" 
                        {...field} 
                        value={field.value ?? ""} 
                        className="bg-background border-input" 
                      />
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
                    <FormLabel className="flex items-center">
                      Ammonia (ppm)
                      <IdealRangeDisplay parameter="ammonia" aquariumType={aquariumType} />
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        {...field} 
                        value={field.value ?? ""} 
                        className="bg-background border-input" 
                      />
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
                    <FormLabel className="flex items-center">
                      Nitrite (ppm)
                      <IdealRangeDisplay parameter="nitrite" aquariumType={aquariumType} />
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        {...field} 
                        value={field.value ?? ""} 
                        className="bg-background border-input" 
                      />
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
                    <FormLabel className="flex items-center">
                      Nitrate (ppm)
                      <IdealRangeDisplay parameter="nitrate" aquariumType={aquariumType} />
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="1" 
                        {...field} 
                        value={field.value ?? ""} 
                        className="bg-background border-input" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(isPlantedFreshwater || isFreshwaterInverts) && (
                  <>
                      <FormField
                        control={form.control}
                        name="gh"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              General Hardness (dGH)
                              <IdealRangeDisplay parameter="gh" aquariumType={aquariumType} />
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1" 
                                {...field} 
                                value={field.value ?? ""} 
                                className="bg-background border-input" 
                              />
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
                            <FormLabel className="flex items-center">
                              Carbonate Hardness (dKH)
                              <IdealRangeDisplay parameter="kh" aquariumType={aquariumType} />
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1" 
                                {...field} 
                                value={field.value ?? ""} 
                                className="bg-background border-input" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </>
              )}
              
              {isPlantedFreshwater && (
                  <FormField
                    control={form.control}
                    name="co2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          CO2 (ppm)
                          <IdealRangeDisplay parameter="co2" aquariumType={aquariumType} />
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="1" 
                            {...field} 
                            value={field.value ?? ""} 
                            className="bg-background border-input" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              )}

              {isFreshwaterInverts && (
                  <FormField
                    control={form.control}
                    name="copper"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          Copper (ppm)
                          <IdealRangeDisplay parameter="copper" aquariumType={aquariumType} />
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            {...field} 
                            value={field.value ?? ""} 
                            className="bg-background border-input" 
                          />
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
                            <FormLabel className="flex items-center">
                              Salinity (ppt)
                              <IdealRangeDisplay parameter="salinity" aquariumType={aquariumType} />
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.001" 
                                {...field} 
                                value={field.value ?? ""} 
                                className="bg-background border-input" 
                              />
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
                            <FormLabel className="flex items-center">
                              Alkalinity (dKH)
                              <IdealRangeDisplay parameter="alkalinity" aquariumType={aquariumType} />
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1" 
                                {...field} 
                                value={field.value ?? ""} 
                                className="bg-background border-input" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </>
              )}
              
              {(isFOWLR || isReef) && (
                  <>
                      <FormField
                        control={form.control}
                        name="calcium"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              Calcium (ppm)
                              <IdealRangeDisplay parameter="calcium" aquariumType={aquariumType} />
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="1" 
                                {...field} 
                                value={field.value ?? ""} 
                                className="bg-background border-input" 
                              />
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
                            <FormLabel className="flex items-center">
                              Magnesium (ppm)
                              <IdealRangeDisplay parameter="magnesium" aquariumType={aquariumType} />
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="1" 
                                {...field} 
                                value={field.value ?? ""} 
                                className="bg-background border-input" 
                              />
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
                        <FormLabel className="flex items-center">
                          Phosphate (ppm)
                          <IdealRangeDisplay parameter="phosphate" aquariumType={aquariumType} />
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            {...field} 
                            value={field.value ?? ""} 
                            className="bg-background border-input" 
                          />
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
                          <CalendarIcon className="mr-2 h-4 w-4" />
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
    </ScrollArea>
  );
}
