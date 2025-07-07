import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface ProductInventorySectionProps {
  control: Control<any>;
  watchTrackInventory: boolean;
}

export const ProductInventorySection = ({ control, watchTrackInventory }: ProductInventorySectionProps) => {
  return (
    <div className="space-y-4 border-t pt-4">
      <FormField
        control={control}
        name="track_inventory"
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2 space-y-0">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel>Track Inventory</FormLabel>
          </FormItem>
        )}
      />

      {watchTrackInventory && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="stock_quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="low_stock_threshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Low Stock Threshold</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="5"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};