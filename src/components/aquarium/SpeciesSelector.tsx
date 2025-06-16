
import { useState } from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { livestockCategories } from "@/data/livestockCategories";

interface SpeciesSelectorProps {
  value: string;
  onChange: (value: string) => void;
  aquariumType: string | null;
}

export function SpeciesSelector({ value, onChange, aquariumType }: SpeciesSelectorProps) {
  const [open, setOpen] = useState(false);

  const getSpeciesOptions = () => {
    const tankTypeKey = aquariumType as keyof typeof livestockCategories;
    return livestockCategories[tankTypeKey] || livestockCategories["Freshwater"];
  };

  const speciesCategories = getSpeciesOptions();

  return (
    <FormItem className="flex flex-col">
      <FormLabel>Species</FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between",
                !value && "text-muted-foreground"
              )}
            >
              {value || "Select a species..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-[95vw] max-w-none p-0" align="start">
          <Command>
            <CommandInput placeholder="Search species..." />
            <CommandList 
              className="max-h-[400px] overflow-y-auto"
              onWheel={(e) => {
                e.stopPropagation();
              }}
            >
              <CommandEmpty>No species found.</CommandEmpty>
              <div className="grid grid-cols-3 gap-0">
                {Object.entries(speciesCategories).map(([category, species]) => (
                  <div key={category} className="min-w-0">
                    <CommandGroup heading={category}>
                      {species.map((speciesName) => (
                        <CommandItem
                          key={speciesName}
                          value={speciesName}
                          onSelect={() => {
                            onChange(speciesName);
                            setOpen(false);
                          }}
                          className="text-sm"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === speciesName ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {speciesName}
                        </CommandItem>
                      ))}
                      <CommandItem
                        key={`${category}-other`}
                        value={`Other ${category}`}
                        onSelect={() => {
                          onChange(`Other ${category}`);
                          setOpen(false);
                        }}
                        className="text-sm font-medium text-muted-foreground"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === `Other ${category}` ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Other {category}
                      </CommandItem>
                    </CommandGroup>
                  </div>
                ))}
              </div>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
}
