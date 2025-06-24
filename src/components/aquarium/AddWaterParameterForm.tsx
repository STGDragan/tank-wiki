
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Plus, X } from "lucide-react";
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

interface CustomTest {
  name: string;
  value: string;
  unit: string;
}

interface AddWaterParameterFormProps {
  aquariumId: string;
  aquariumType: string | null;
  onSuccess: () => void;
}

const otherTestOptions = [
  { value: "iron", label: "Iron", unit: "ppm" },
  { value: "silicate", label: "Silicate", unit: "ppm" },
  { value: "iodine", label: "Iodine", unit: "ppm" },
  { value: "strontium", label: "Strontium", unit: "ppm" },
  { value: "boron", label: "Boron", unit: "ppm" },
  { value: "fluoride", label: "Fluoride", unit: "ppm" },
  { value: "bromide", label: "Bromide", unit: "ppm" },
  { value: "potassium", label: "Potassium", unit: "ppm" },
  { value: "redox", label: "Redox (ORP)", unit: "mV" },
  { value: "tds", label: "Total Dissolved Solids", unit: "ppm" },
  { value: "conductivity", label: "Conductivity", unit: "μS/cm" },
];

// Fetch most recent water parameters for auto-population
const fetchLatestWaterParameters = async (aquariumId: string) => {
  const { data, error } = await supabase
    .from('water_parameters')
    .select('*')
    .eq('aquarium_id', aquariumId)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }
  return data;
};

export function AddWaterParameterForm({ aquariumId, aquariumType, onSuccess }: AddWaterParameterFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [customTests, setCustomTests] = useState<CustomTest[]>([]);
  const [selectedOtherTest, setSelectedOtherTest] = useState<string>("");

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
      temperature: latestParams?.temperature ?? null,
      ph: latestParams?.ph ?? null,
      ammonia: latestParams?.ammonia ?? null,
      nitrite: latestParams?.nitrite ?? null,
      nitrate: latestParams?.nitrate ?? null,
      salinity: latestParams?.salinity ?? null,
      alkalinity: latestParams?.alkalinity ?? null,
      calcium: latestParams?.calcium ?? null,
      magnesium: latestParams?.magnesium ?? null,
      gh: latestParams?.gh ?? null,
      kh: latestParams?.kh ?? null,
      co2: latestParams?.co2 ?? null,
      phosphate: latestParams?.phosphate ?? null,
      copper: latestParams?.copper ?? null,
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

  const addOtherTest = () => {
    if (selectedOtherTest) {
      const testOption = otherTestOptions.find(option => option.value === selectedOtherTest);
      if (testOption) {
        setCustomTests([...customTests, { name: testOption.label, value: "", unit: testOption.unit }]);
        setSelectedOtherTest("");
      }
    }
  };

  const addCustomTest = () => {
    setCustomTests([...customTests, { name: "", value: "", unit: "ppm" }]);
  };

  const removeCustomTest = (index: number) => {
    setCustomTests(customTests.filter((_, i) => i !== index));
  };

  const updateCustomTest = (index: number, field: keyof CustomTest, value: string) => {
    const updated = customTests.map((test, i) => 
      i === index ? { ...test, [field]: value } : test
    );
    setCustomTests(updated);
  };

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
              
              {/* Hide GH and KH for freshwater AND saltwater fish-only tanks */}
              {!isFreshwater && !isPlantedFreshwater && !isFreshwaterInverts && !isSaltwaterFO && (
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

          {/* Other Tests Section */}
          <div className="mt-6 p-4 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-4">Additional Tests</h3>
            
            {/* Predefined Other Tests Dropdown */}
            <div className="flex gap-2 mb-4">
              <Select value={selectedOtherTest} onValueChange={setSelectedOtherTest}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select additional test..." />
                </SelectTrigger>
                <SelectContent>
                  {otherTestOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} ({option.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={addOtherTest} disabled={!selectedOtherTest}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Custom Test Button */}
            <Button type="button" variant="outline" onClick={addCustomTest} className="mb-4">
              <Plus className="h-4 w-4 mr-2" /> Add Custom Test
            </Button>

            {/* Display Added Tests */}
            {customTests.map((test, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                <div className="col-span-4">
                  <Input
                    placeholder="Test name"
                    value={test.name}
                    onChange={(e) => updateCustomTest(index, 'name', e.target.value)}
                    className="bg-background border-input"
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Value"
                    value={test.value}
                    onChange={(e) => updateCustomTest(index, 'value', e.target.value)}
                    className="bg-background border-input"
                  />
                </div>
                <div className="col-span-4">
                  <Input
                    placeholder="Unit (e.g., ppm, mg/L)"
                    value={test.unit}
                    onChange={(e) => updateCustomTest(index, 'unit', e.target.value)}
                    className="bg-background border-input"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCustomTest(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
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
    </ScrollArea>
  );
}
