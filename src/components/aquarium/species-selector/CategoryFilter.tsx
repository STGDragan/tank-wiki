
import { livestockCategories } from "@/data/species";

interface CategoryFilterProps {
  aquariumType: string | null;
}

export function useFilteredCategories({ aquariumType }: CategoryFilterProps) {
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
      return true;
    });
  };

  return getRelevantCategories();
}
