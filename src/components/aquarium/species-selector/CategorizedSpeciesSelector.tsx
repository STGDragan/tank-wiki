
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFilteredCategories } from "./CategoryFilter";
import { useCategorizedSpecies } from "./CategoryOrganizer";
import { Plus } from "lucide-react";

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
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSpecies, setSelectedSpecies] = useState<string>("");
  
  const relevantCategories = useFilteredCategories({ aquariumType });
  const { categorizedSpecies } = useCategorizedSpecies({ categories: relevantCategories });

  const handleAddSpecies = () => {
    if (selectedSpecies && !value.includes(selectedSpecies)) {
      onChange(selectedSpecies);
      setSelectedSpecies("");
    }
  };

  const selectedCategoryData = categorizedSpecies.find(cat => cat.name === selectedCategory);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Add Species by Category</Label>
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select category type..." />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border dark:border-slate-700 z-50">
              {categorizedSpecies.map((category) => (
                <SelectItem key={category.name} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedCategory && selectedCategoryData && (
        <div className="space-y-2">
          <Label>Select {selectedCategory}</Label>
          <div className="flex gap-2">
            <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={`Choose ${selectedCategory.toLowerCase()}...`} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 border dark:border-slate-700 z-50 max-h-[300px] overflow-y-auto">
                {selectedCategoryData.species
                  .filter(species => !value.includes(species))
                  .map((species) => (
                    <SelectItem key={species} value={species}>
                      {species}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAddSpecies}
              disabled={!selectedSpecies || value.includes(selectedSpecies)}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {value.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Species ({value.length})</Label>
          <div className="flex flex-wrap gap-2">
            {value.map(species => (
              <Badge 
                key={species} 
                variant="secondary" 
                className="cursor-pointer dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600" 
                onClick={() => onChange(species)}
              >
                {species} ✕
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
