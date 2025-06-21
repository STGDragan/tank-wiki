
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saltwaterFish } from "@/data/species/saltwaterFish";
import { freshwaterFish, freshwaterInvertebrates, aquaticPlants } from "@/data/species/freshwaterSpecies";
import { coralSpecies } from "@/data/species/coralSpecies";
import { marineInvertebrates } from "@/data/species/marineInvertebrates";
import { anemoneSpecies, clamSpecies } from "@/data/species/specialtySpecies";

interface CascadingSpeciesSelectorProps {
  value: string;
  onChange: (value: string) => void;
  livestockType: string;
  aquariumType: string | null;
}

const getSpeciesForType = (livestockType: string, aquariumType: string | null): string[] => {
  if (!livestockType) return [];

  const isSaltwater = aquariumType === "saltwater" || aquariumType === "reef";

  switch (livestockType) {
    case "fish":
      return isSaltwater ? saltwaterFish : freshwaterFish;
    case "invertebrate":
      return isSaltwater ? marineInvertebrates : freshwaterInvertebrates;
    case "plant":
      return aquaticPlants;
    case "coral":
      return coralSpecies;
    case "anemone":
      return anemoneSpecies;
    case "clam":
      return clamSpecies;
    default:
      return [];
  }
};

export function CascadingSpeciesSelector({ 
  value, 
  onChange, 
  livestockType, 
  aquariumType 
}: CascadingSpeciesSelectorProps) {
  const species = getSpeciesForType(livestockType, aquariumType);

  if (!livestockType) {
    return (
      <FormItem>
        <FormLabel>Species</FormLabel>
        <FormControl>
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="Select livestock type first..." />
            </SelectTrigger>
          </Select>
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  }

  return (
    <FormItem>
      <FormLabel>Species</FormLabel>
      <Select value={value} onValueChange={onChange}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select species..." />
          </SelectTrigger>
        </FormControl>
        <SelectContent className="max-h-64 overflow-y-auto">
          {species.map((speciesName) => (
            <SelectItem key={speciesName} value={speciesName}>
              {speciesName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
}
