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

const numberOrEmptyToDefault = z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : v),
    z.coerce.number().min(0).default(0)
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

export function AddWaterParameterForm({ aquariumId, aquariumType, onSuccess }: AddWaterParameterFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [customTests, setCustomTests] = useState<CustomTest[]>([]);
  const [selectedOtherTest, setSelectedOtherTest] = useState<string>("");

  const form = useForm<WaterParametersFormValues>({
    resolver: zodResolver(waterParametersFormSchema),
    defaultValues: {
      recorded_at: new Date(),
      temperature: 0,
      ph: 0,
      ammonia: 0,
      nitrite: 0,
      nitrate: 0,
      salinity: 0,
      alkalinity: 0,
      calcium: 0,
      magnesium: 0,
      gh: 0,
      kh: 0,
      co2: 0,
      phosphate: 0,
      copper: 0,
    },
  });

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
      temperature: values.temperature || null,
      ph: values.ph || null,
      ammonia: values.ammonia || null,
      nitrite: values.nitrite || null,
      nitrate: values.nitrate || null,
      salinity: values.salinity || null,
      alkalinity: values.alkalinity || null,
      calcium: values.calcium || null,
      magnesium: values.magnesium || null,
      gh: values.gh || null,
      kh: values.kh || null,
      co2: values.co2 || null,
      phosphate: values.phosphate || null,
      copper: values.copper || null,
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
                    <FormLabel>Temperature (°F)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} value={field.value} />
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
                      <Input type="number" step="0.1" {...field} value={field.value} />
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
                      <Input type="number" step="0.01" {...field} value={field.value} />
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
                      <Input type="number" step="0.01" {...field} value={field.value} />
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
                      <Input type="number" step="1" {...field} value={field.value} />
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
                            <FormLabel>General Hardness (dGH)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" {...field} value={field.value} />
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
                              <Input type="number" step="0.1" {...field} value={field.value} />
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
                        <FormLabel>CO2 (ppm)</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" {...field} value={field.value} />
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
                        <FormLabel>Copper (ppm)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} value={field.value} />
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
                              <Input type="number" step="0.1" {...field} value={field.value} />
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
                              <Input type="number" step="0.1" {...field} value={field.value} />
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
                            <FormLabel>Calcium (ppm)</FormLabel>
                            <FormControl>
                              <Input type="number" step="1" {...field} value={field.value} />
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
                              <Input type="number" step="1" {...field} value={field.value} />
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
                          <Input type="number" step="0.01" {...field} value={field.value} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              )}
          </div>

          {/* Other Tests Section */}
          <div className="mt-6 p-4 border rounded-lg bg-muted">
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
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Value"
                    value={test.value}
                    onChange={(e) => updateCustomTest(index, 'value', e.target.value)}
                  />
                </div>
                <div className="col-span-4">
                  <Input
                    placeholder="Unit (e.g., ppm, mg/L)"
                    value={test.unit}
                    onChange={(e) => updateCustomTest(index, 'unit', e.target.value)}
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
