
import { FormItem, FormLabel, FormControl, FormMessage, useFormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { useFilteredCategories } from "./species-selector/CategoryFilter";
import { useCategorizedSpecies } from "./species-selector/CategoryOrganizer";
import { SpeciesCombobox } from "./species-selector/SpeciesCombobox";
import { SpeciesInfoCard } from "./species-selector/SpeciesInfoCard";
import { useFormContext } from "react-hook-form";

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
  
  // Check if we're inside a form context
  const formContext = useFormContext();
  const isInFormContext = formContext !== null;

  if (isInFormContext) {
    // Use form components when inside a form context
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

  // Use regular components when outside a form context
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Species</Label>
        <SpeciesCombobox
          value={value}
          onChange={onChange}
          allSpecies={allSpecies}
          categorizedSpecies={categorizedSpecies}
        />
      </div>
      
      {showDetailsCard && value && (
        <SpeciesInfoCard speciesName={value} />
      )}
    </div>
  );
}
