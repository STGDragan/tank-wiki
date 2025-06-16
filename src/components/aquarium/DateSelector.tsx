
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DateSelectorProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  label: string;
  placeholder?: string;
}

export function DateSelector({ value, onChange, label, placeholder = "Pick a date" }: DateSelectorProps) {
  return (
    <FormItem className="flex flex-col">
      <FormLabel>{label}</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant={"outline"}
              className={cn(
                "w-full pl-3 text-left font-normal justify-start",
                !value && "text-muted-foreground"
              )}
            >
              {value ? (
                format(value, "PPP")
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
}
