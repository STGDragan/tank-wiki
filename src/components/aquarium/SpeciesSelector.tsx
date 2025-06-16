
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useFilteredCategories } from "./species-selector/CategoryFilter";
import { useCategorizedSpecies } from "./species-selector/CategoryOrganizer";
import { SpeciesCombobox } from "./species-selector/SpeciesCombobox";
import { SpeciesInfoCard } from "./species-selector/SpeciesInfoCard";

interface SpeciesSelectorProps {
  value: string;
  onChange: (value: string) => void;
  aquariumType: string | null;
  showDetailsCard?: boolean;
}

export function SpeciesSelector({ 
  value, 
  onChange, 
  aquariumType, 
  showDetailsCard = false 
}: SpeciesSelectorProps) {
  const relevantCategories = useFilteredCategories({ aquariumType });
  const { categorizedSpecies, allSpecies } = useCategorizedSpecies({ categories: relevantCategories });

  return (
    <div className="space-y-4">
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
      
      {showDetailsCard && value && (
        <SpeciesInfoCard speciesName={value} />
      )}
    </div>
  );
}
