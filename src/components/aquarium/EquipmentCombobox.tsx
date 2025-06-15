
import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { UseFormReturn } from 'react-hook-form';

interface EquipmentComboboxProps {
    field: any;
    form: UseFormReturn<any>;
    options: { value: string; label: string; }[];
}

export const EquipmentCombobox = ({ field, form, options }: EquipmentComboboxProps) => {
    const [open, setOpen] = useState(false);
    const selectedValue = options.find(option => option.value === field.value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <FormControl>
                    <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                        )}
                    >
                        {selectedValue?.label || field.value || "Select or type equipment"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command filter={(value, search) => {
                    const option = options.find(opt => opt.value === value);
                    if (option) {
                      return option.label.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
                    }
                    // if search has a value but no options match, we are creating a new one
                    if(search) return 1;
                    return 0;
                }}>
                    <CommandInput
                        placeholder="Search or add new equipment..."
                        onValueChange={field.onChange}
                        value={field.value}
                    />
                    <CommandList>
                        <CommandEmpty>No equipment found. A new one will be created.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={(currentValue) => {
                                        form.setValue("equipment_id", currentValue === field.value ? "" : currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            field.value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
