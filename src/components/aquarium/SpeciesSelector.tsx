
import { useState } from "react";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const [customSpecies, setCustomSpecies] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Get relevant categories based on aquarium type
  const getRelevantCategories = () => {
    if (!aquariumType) return livestockCategories;
    
    const type = aquariumType.toLowerCase();
    return livestockCategories.filter(category => {
      if (type.includes('freshwater') || type.includes('fresh water')) {
        return category.environments.includes('freshwater');
      }
      if (type.includes('saltwater') || type.includes('salt water') || type.includes('marine')) {
        return category.environments.includes('saltwater');
      }
      if (type.includes('reef')) {
        return category.environments.includes('reef');
      }
      return true; // Show all if type doesn't match known patterns
    });
  };

  const relevantCategories = getRelevantCategories();
  const allSpecies = relevantCategories.flatMap(category => category.species);

  const handleCustomSubmit = () => {
    if (customSpecies.trim()) {
      onChange(customSpecies.trim());
      setCustomSpecies("");
      setShowCustomInput(false);
      setOpen(false);
    }
  };

  const handleSelectSpecies = (selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
    setShowCustomInput(false);
  };

  return (
    <FormItem>
      <FormLabel>Species</FormLabel>
      <FormControl>
        <div className="space-y-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {value || "Select species..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search species..." />
                <CommandList>
                  <CommandEmpty>
                    <div className="p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-2">No species found.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCustomInput(true)}
                      >
                        Add Custom Species
                      </Button>
                    </div>
                  </CommandEmpty>
                  {relevantCategories.map((category) => (
                    <CommandGroup key={category.name} heading={category.name}>
                      {category.species.map((species) => (
                        <CommandItem
                          key={species}
                          value={species}
                          onSelect={() => handleSelectSpecies(species)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === species ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {species}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                  <CommandGroup>
                    <CommandItem onSelect={() => setShowCustomInput(true)}>
                      <ChevronsUpDown className="mr-2 h-4 w-4" />
                      Add Custom Species
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          
          {showCustomInput && (
            <div className="flex gap-2">
              <Input
                placeholder="Enter custom species name..."
                value={customSpecies}
                onChange={(e) => setCustomSpecies(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCustomSubmit();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleCustomSubmit}
                disabled={!customSpecies.trim()}
              >
                Add
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomSpecies("");
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
