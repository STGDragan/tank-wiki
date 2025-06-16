
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";

interface ContextSelectFieldProps {
  control: Control<any>;
  isDisabled: boolean;
}

export function ContextSelectField({ control, isDisabled }: ContextSelectFieldProps) {
  return (
    <FormField
      control={control}
      name="context"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Context</FormLabel>
          <Select onValueChange={field.onChange} value={field.value} disabled={isDisabled}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a context" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="landing-page">Landing Page</SelectItem>
              <SelectItem value="dashboard">Dashboard</SelectItem>
              <SelectItem value="knowledge-base">Knowledge Base</SelectItem>
              <SelectItem value="not-used">Not Used</SelectItem>
            </SelectContent>
          </Select>
          <FormDescription>
            Select where this slideshow will appear.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
