
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpeciesComboboxProps {
  value: string;
  onChange: (value: string) => void;
  allSpecies: string[];
  categorizedSpecies: Array<{
    name: string;
    species: string[];
  }>;
}

export function SpeciesCombobox({ value, onChange, allSpecies, categorizedSpecies }: SpeciesComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSelectSpecies = (selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
    setSearchValue("");
  };

  const handleCustomEntry = () => {
    if (searchValue.trim()) {
      onChange(searchValue.trim());
      setOpen(false);
      setSearchValue("");
    }
  };

  const searchMatches = allSpecies.some(species => 
    species.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || "Select or type species name..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search or type new species..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              <div className="p-4 text-center">
                {searchValue ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">No matching species found.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCustomEntry}
                      className="w-full"
                    >
                      Add "{searchValue}" as new species
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Start typing to search or add a new species.</p>
                )}
              </div>
            </CommandEmpty>
            
            {searchValue && !searchMatches && (
              <CommandGroup heading="Add New">
                <CommandItem onSelect={handleCustomEntry}>
                  <ChevronsUpDown className="mr-2 h-4 w-4" />
                  Add "{searchValue}" as new species
                </CommandItem>
              </CommandGroup>
            )}

            {categorizedSpecies.map((category) => (
              <CommandGroup key={category.name} heading={category.name}>
                {category.species
                  .filter(species => !searchValue || species.toLowerCase().includes(searchValue.toLowerCase()))
                  .map((species) => (
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
