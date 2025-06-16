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
  const [searchValue, setSearchValue] = useState("");

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

  // Check if search value matches any existing species
  const searchMatches = allSpecies.some(species => 
    species.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <FormItem>
      <FormLabel>Species</FormLabel>
      <FormControl>
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
                
                {/* Show custom entry option if user is typing and no exact match */}
                {searchValue && !searchMatches && (
                  <CommandGroup heading="Add New">
                    <CommandItem onSelect={handleCustomEntry}>
                      <ChevronsUpDown className="mr-2 h-4 w-4" />
                      Add "{searchValue}" as new species
                    </CommandItem>
                  </CommandGroup>
                )}

                {/* Fish */}
                {relevantCategories.find(cat => cat.name === "Freshwater Fish" || cat.name === "Saltwater Fish") && (
                  <>
                    {relevantCategories.filter(cat => cat.name.includes("Fish")).map((category) => (
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
                  </>
                )}

                {/* Invertebrates */}
                {relevantCategories.find(cat => cat.name.includes("Invertebrates")) && (
                  <>
                    {relevantCategories.filter(cat => cat.name.includes("Invertebrates")).map((category) => (
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
                  </>
                )}

                {/* Plants */}
                {relevantCategories.find(cat => cat.name.includes("Plants")) && (
                  <>
                    {relevantCategories.filter(cat => cat.name.includes("Plants")).map((category) => (
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
                  </>
                )}

                {/* Corals */}
                {relevantCategories.find(cat => cat.name.includes("Coral")) && (
                  <>
                    {relevantCategories.filter(cat => cat.name.includes("Coral")).map((category) => (
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
                  </>
                )}

                {/* Other categories */}
                {relevantCategories.filter(cat => 
                  !cat.name.includes("Fish") && 
                  !cat.name.includes("Invertebrates") && 
                  !cat.name.includes("Plants") && 
                  !cat.name.includes("Coral")
                ).map((category) => (
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
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
