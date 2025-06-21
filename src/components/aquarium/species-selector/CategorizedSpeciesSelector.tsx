
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useFilteredCategories } from "./CategoryFilter";
import { useCategorizedSpecies } from "./CategoryOrganizer";
import { CompatibilityChecker } from "./CompatibilityChecker";
import { Plus, X } from "lucide-react";

interface CategorizedSpeciesSelectorProps {
  value: string[];
  onChange: (species: string) => void;
  aquariumType: string | null;
}

export function CategorizedSpeciesSelector({ 
  value, 
  onChange, 
  aquariumType 
}: CategorizedSpeciesSelectorProps) {
  const [selectedSpeciesPerCategory, setSelectedSpeciesPerCategory] = useState<{ [key: string]: string }>({});
  const [customSpeciesInputs, setCustomSpeciesInputs] = useState<{ [key: string]: string }>({});
  
  const relevantCategories = useFilteredCategories({ aquariumType });
  const { categorizedSpecies } = useCategorizedSpecies({ categories: relevantCategories });

  const handleAddSpecies = (categoryName: string) => {
    const selectedSpecies = selectedSpeciesPerCategory[categoryName];
    if (selectedSpecies && !value.includes(selectedSpecies)) {
      onChange(selectedSpecies);
      setSelectedSpeciesPerCategory(prev => ({ ...prev, [categoryName]: "" }));
    }
  };

  const handleAddCustomSpecies = (categoryName: string) => {
    const customSpecies = customSpeciesInputs[categoryName]?.trim();
    if (customSpecies && !value.includes(customSpecies)) {
      onChange(customSpecies);
      setCustomSpeciesInputs(prev => ({ ...prev, [categoryName]: "" }));
    }
  };

  const handleCustomSpeciesChange = (categoryName: string, customValue: string) => {
    setCustomSpeciesInputs(prev => ({ ...prev, [categoryName]: customValue }));
  };

  const handleSpeciesSelect = (categoryName: string, species: string) => {
    setSelectedSpeciesPerCategory(prev => ({ ...prev, [categoryName]: species }));
  };

  const removeSpecies = (species: string) => {
    onChange(species);
  };

  return (
    <div className="space-y-6">
      {/* Compatibility Checker */}
      {value.length > 1 && (
        <CompatibilityChecker 
          selectedSpecies={value} 
          aquariumType={aquariumType} 
        />
      )}

      {categorizedSpecies.map((category) => (
        <div key={category.name} className="space-y-3">
          <Label className="text-base font-medium dark:text-slate-200">{category.name}</Label>
          
          {/* Species Selection Dropdown */}
          <div className="flex gap-2">
            <Select 
              value={selectedSpeciesPerCategory[category.name] || ""} 
              onValueChange={(species) => handleSpeciesSelect(category.name, species)}
            >
              <SelectTrigger className="flex-1 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200">
                <SelectValue placeholder={`Choose ${category.name.toLowerCase()}...`} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 border dark:border-slate-700 z-50 max-h-[300px] overflow-y-auto">
                {category.species
                  .filter(species => !value.includes(species))
                  .map((species) => (
                    <SelectItem key={species} value={species}>
                      {species}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={() => handleAddSpecies(category.name)}
              disabled={!selectedSpeciesPerCategory[category.name] || value.includes(selectedSpeciesPerCategory[category.name])}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Custom Species Input */}
          <div className="flex gap-2">
            <Input
              placeholder={`Add custom ${category.name.toLowerCase()}...`}
              value={customSpeciesInputs[category.name] || ""}
              onChange={(e) => handleCustomSpeciesChange(category.name, e.target.value)}
              className="flex-1 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomSpecies(category.name);
                }
              }}
            />
            <Button 
              onClick={() => handleAddCustomSpecies(category.name)}
              disabled={!customSpeciesInputs[category.name]?.trim()}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Selected Species for this Category */}
          {value.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {value
                  .filter(species => {
                    // Show species that belong to this category OR custom species
                    return category.species.includes(species) || 
                           !categorizedSpecies.some(cat => cat.species.includes(species));
                  })
                  .map(species => (
                    <Badge 
                      key={species} 
                      variant="secondary" 
                      className="cursor-pointer dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 flex items-center gap-1" 
                      onClick={() => removeSpecies(species)}
                    >
                      {species} 
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {value.length > 0 && (
        <div className="space-y-2 pt-4 border-t dark:border-slate-700">
          <Label className="text-base font-medium dark:text-slate-200">
            All Selected Species ({value.length})
          </Label>
          <div className="flex flex-wrap gap-2">
            {value.map(species => (
              <Badge 
                key={species} 
                variant="default" 
                className="cursor-pointer bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:hover:bg-blue-800/50 flex items-center gap-1" 
                onClick={() => removeSpecies(species)}
              >
                {species} 
                <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
