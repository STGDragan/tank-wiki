
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { toast } from "@/hooks/use-toast";

const quickLogSchema = z.object({
  notes: z.string().optional(),
  // Water change specific
  waterChangeAmount: z.string().optional(),
  waterChangeUnit: z.enum(['percentage', 'volume']).optional(),
  // Water test parameters
  temperature: z.string().optional(),
  ph: z.string().optional(),
  ammonia: z.string().optional(),
  nitrite: z.string().optional(),
  nitrate: z.string().optional(),
  gh: z.string().optional(),
  kh: z.string().optional(),
  co2: z.string().optional(),
  phosphate: z.string().optional(),
  copper: z.string().optional(),
  salinity: z.string().optional(),
  alkalinity: z.string().optional(),
  calcium: z.string().optional(),
  magnesium: z.string().optional(),
});

type QuickLogFormValues = z.infer<typeof quickLogSchema>;

interface QuickLogFormProps {
  aquariumId: string;
  aquariumType?: string | null;
  aquariumSize?: number | null;
  actionType: string;
  onSuccess: () => void;
}

const getActionTitle = (actionType: string): string => {
  const titles: Record<string, string> = {
    water_change: 'Water Change',
    water_test: 'Water Test',
    clean_filter: 'Filter Cleaning',
    maintenance: 'General Maintenance',
  };
  return titles[actionType] || 'Activity';
};

export const QuickLogForm = ({ 
  aquariumId, 
  aquariumType, 
  aquariumSize, 
  actionType, 
  onSuccess 
}: QuickLogFormProps) => {
  const { addLog } = useActivityLogs(aquariumId);
  const { preferences, formatVolume, convertVolume } = useUserPreferences();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<QuickLogFormValues>({
    resolver: zodResolver(quickLogSchema),
    defaultValues: {
      notes: "",
      waterChangeUnit: 'percentage',
      // Default water test values to "0"
      temperature: actionType === 'water_test' ? "0" : "",
      ph: actionType === 'water_test' ? "0" : "",
      ammonia: actionType === 'water_test' ? "0" : "",
      nitrite: actionType === 'water_test' ? "0" : "",
      nitrate: actionType === 'water_test' ? "0" : "",
      gh: actionType === 'water_test' ? "0" : "",
      kh: actionType === 'water_test' ? "0" : "",
      co2: actionType === 'water_test' ? "0" : "",
      phosphate: actionType === 'water_test' ? "0" : "",
      copper: actionType === 'water_test' ? "0" : "",
      salinity: actionType === 'water_test' ? "0" : "",
      alkalinity: actionType === 'water_test' ? "0" : "",
      calcium: actionType === 'water_test' ? "0" : "",
      magnesium: actionType === 'water_test' ? "0" : "",
    },
  });

  const watchWaterChangeAmount = form.watch('waterChangeAmount');
  const watchWaterChangeUnit = form.watch('waterChangeUnit');

  async function onSubmit(values: QuickLogFormValues) {
    setIsSubmitting(true);
    
    try {
      const title = getActionTitle(actionType);
      let description = values.notes || '';
      const logData: any = { ...values };

      // Handle water change specifics
      if (actionType === 'water_change' && values.waterChangeAmount) {
        const amount = parseFloat(values.waterChangeAmount);
        if (values.waterChangeUnit === 'percentage' && aquariumSize) {
          const volumeUnit = preferences?.units_volume || 'gallons';
          const volumeAmount = (aquariumSize * amount) / 100;
          description = `${amount}% water change (${formatVolume(volumeAmount, volumeUnit)})${description ? ` - ${description}` : ''}`;
          logData.waterChangePercentage = amount;
          logData.waterChangeVolume = volumeAmount;
          logData.volumeUnit = volumeUnit;
        } else {
          const volumeUnit = preferences?.units_volume || 'gallons';
          description = `${formatVolume(amount, volumeUnit)} water change${description ? ` - ${description}` : ''}`;
          logData.waterChangeVolume = amount;
          logData.volumeUnit = volumeUnit;
        }
      }

      // Handle water test parameters
      if (actionType === 'water_test') {
        const params = [];
        if (values.temperature && values.temperature !== "0") params.push(`Temp: ${values.temperature}°`);
        if (values.ph && values.ph !== "0") params.push(`pH: ${values.ph}`);
        if (values.ammonia && values.ammonia !== "0") params.push(`Ammonia: ${values.ammonia} ppm`);
        if (values.nitrite && values.nitrite !== "0") params.push(`Nitrite: ${values.nitrite} ppm`);
        if (values.nitrate && values.nitrate !== "0") params.push(`Nitrate: ${values.nitrate} ppm`);
        
        const isFreshwater = aquariumType === "Freshwater" || aquariumType === "Planted Freshwater Tank";
        const isSaltwaterFO = aquariumType === "Saltwater Fish-Only (FO)";
        
        if (!isFreshwater && !isSaltwaterFO) {
          if (values.gh && values.gh !== "0") params.push(`GH: ${values.gh} dGH`);
          if (values.kh && values.kh !== "0") params.push(`KH: ${values.kh} dKH`);
        }
        
        if (values.co2 && values.co2 !== "0") params.push(`CO2: ${values.co2} ppm`);
        if (values.phosphate && values.phosphate !== "0") params.push(`Phosphate: ${values.phosphate} ppm`);
        if (values.copper && values.copper !== "0") params.push(`Copper: ${values.copper} ppm`);
        if (values.salinity && values.salinity !== "0") params.push(`Salinity: ${values.salinity} ppt`);
        if (values.alkalinity && values.alkalinity !== "0") params.push(`Alkalinity: ${values.alkalinity} dKH`);
        if (values.calcium && values.calcium !== "0") params.push(`Calcium: ${values.calcium} ppm`);
        if (values.magnesium && values.magnesium !== "0") params.push(`Magnesium: ${values.magnesium} ppm`);
        
        if (params.length > 0) {
          description = params.join(' | ') + (description ? ` - ${description}` : '');
        }
      }

      await addLog({
        aquarium_id: aquariumId,
        activity_type: actionType as any,
        title,
        description: description || undefined,
        data: logData,
        logged_at: new Date().toISOString(),
      });

      toast({ title: "Activity logged successfully!" });
      onSuccess();
      form.reset();
    } catch (error) {
      toast({
        title: "Error logging activity",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const renderWaterChangeForm = () => (
    <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700">
      <CardHeader>
        <CardTitle className="text-sm">Water Change Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="waterChangeAmount"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Amount"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="waterChangeUnit"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="percentage">%</SelectItem>
                    <SelectItem value="volume">{preferences?.units_volume === 'liters' ? 'L' : 'gal'}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {aquariumSize && watchWaterChangeUnit === 'percentage' && watchWaterChangeAmount && (
          <p className="text-xs text-muted-foreground">
            ≈ {formatVolume((aquariumSize * parseFloat(watchWaterChangeAmount)) / 100)} for this {formatVolume(aquariumSize)} tank
          </p>
        )}
      </CardContent>
    </Card>
  );

  const renderWaterTestForm = () => {
    const isFreshwater = aquariumType === "Freshwater" || aquariumType === "Planted Freshwater Tank";
    const isSaltwaterFO = aquariumType === "Saltwater Fish-Only (FO)";
    
    return (
      <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700">
        <CardHeader>
          <CardTitle className="text-sm">Water Parameters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="temperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Temperature (°F)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
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
                <FormLabel className="text-xs">pH</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
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
                <FormLabel className="text-xs">Ammonia (ppm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
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
                <FormLabel className="text-xs">Nitrite (ppm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
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
                <FormLabel className="text-xs">Nitrate (ppm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {!isFreshwater && !isSaltwaterFO && (
            <>
              <FormField
                control={form.control}
                name="gh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">GH (dGH)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
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
                    <FormLabel className="text-xs">KH (dKH)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          
          {(aquariumType === "Planted Freshwater Tank") && (
            <FormField
              control={form.control}
              name="co2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">CO2 (ppm)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="phosphate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Phosphate (ppm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {(aquariumType === "Freshwater Inverts") && (
            <FormField
              control={form.control}
              name="copper"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Copper (ppm)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {aquariumType?.includes('Saltwater') && (
            <>
              <FormField
                control={form.control}
                name="salinity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Salinity (ppt)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.001" {...field} />
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
                    <FormLabel className="text-xs">Alkalinity (dKH)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
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
                    <FormLabel className="text-xs">Calcium (ppm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" {...field} />
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
                    <FormLabel className="text-xs">Magnesium (ppm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {actionType === 'water_change' && renderWaterChangeForm()}
        {actionType === 'water_test' && renderWaterTestForm()}
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional details about this activity..."
                  className="resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Logging..." : "Log Activity"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
