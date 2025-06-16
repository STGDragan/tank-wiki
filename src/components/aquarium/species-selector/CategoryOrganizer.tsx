interface Category {
  name: string;
  species: string[];
}

interface CategoryOrganizerProps {
  categories: Category[];
}

export function useCategorizedSpecies({ categories }: CategoryOrganizerProps) {
  const organizeCategories = () => {
    const organized: Array<{ name: string; species: string[] }> = [];

    // Fish categories
    const fishCategories = categories.filter(cat => cat.name.includes("Fish"));
    fishCategories.forEach(category => {
      organized.push(category);
    });

    // Invertebrates categories
    const invertebrateCategories = categories.filter(cat => cat.name.includes("Invertebrates"));
    invertebrateCategories.forEach(category => {
      organized.push(category);
    });

    // Plants categories
    const plantCategories = categories.filter(cat => cat.name.includes("Plants"));
    plantCategories.forEach(category => {
      organized.push(category);
    });

    // Coral categories
    const coralCategories = categories.filter(cat => cat.name.includes("Coral"));
    coralCategories.forEach(category => {
      organized.push(category);
    });

    // Other categories
    const otherCategories = categories.filter(cat => 
      !cat.name.includes("Fish") && 
      !cat.name.includes("Invertebrates") && 
      !cat.name.includes("Plants") && 
      !cat.name.includes("Coral")
    );
    otherCategories.forEach(category => {
      organized.push(category);
    });

    return organized;
  };

  const categorizedSpecies = organizeCategories();
  const allSpecies = categories.flatMap(category => category.species);

  return { categorizedSpecies, allSpecies };
}
