
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

interface AltTextFieldProps {
  control: Control<any>;
  isDisabled: boolean;
}

export function AltTextField({ control, isDisabled }: AltTextFieldProps) {
  return (
    <FormField
      control={control}
      name="alt_text"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Alt Text</FormLabel>
          <FormControl>
            <Input placeholder="A beautiful coral reef" {...field} disabled={isDisabled} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
