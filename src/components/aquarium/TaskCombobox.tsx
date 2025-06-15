
import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { UseFormReturn } from 'react-hook-form';

interface TaskComboboxProps {
    field: any;
    form: UseFormReturn<any>;
    options: { value: string; label: string; }[];
}

export const TaskCombobox = ({ field, form, options }: TaskComboboxProps) => {
    const [open, setOpen] = useState(false);

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
                        {field.value || "Select a task or type a new one"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command filter={(value, search) => value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0}>
                    <CommandInput
                        placeholder="Search or add new task..."
                        value={field.value || ''}
                        onValueChange={field.onChange}
                    />
                    <CommandList>
                        <CommandEmpty>No task found. The new task will be created.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={(selectedValue) => {
                                        form.setValue("task", selectedValue);
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
