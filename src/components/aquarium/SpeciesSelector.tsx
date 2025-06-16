
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useFilteredCategories } from "./species-selector/CategoryFilter";
import { useCategorizedSpecies } from "./species-selector/CategoryOrganizer";
import { SpeciesCombobox } from "./species-selector/SpeciesCombobox";

interface SpeciesSelectorProps {
  value: string;
  onChange: (value: string) => void;
  aquariumType: string | null;
}

export function SpeciesSelector({ value, onChange, aquariumType }: SpeciesSelectorProps) {
  const relevantCategories = useFilteredCategories({ aquariumType });
  const { categorizedSpecies, allSpecies } = useCategorizedSpecies({ categories: relevantCategories });

  return (
    <FormItem>
      <FormLabel>Species</FormLabel>
      <FormControl>
        <SpeciesCombobox
          value={value}
          onChange={onChange}
          allSpecies={allSpecies}
          categorizedSpecies={categorizedSpecies}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
