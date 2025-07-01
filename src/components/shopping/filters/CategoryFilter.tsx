import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterState, Category } from "../types";

interface CategoryFilterProps {
  categories: Category[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const CategoryFilter = ({ categories, filters, onFiltersChange }: CategoryFilterProps) => {
  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    onFiltersChange({ ...filters, [key]: newArray });
  };

  // Group categories by hierarchy for better display
  const rootCategories = categories.filter(cat => cat.parent_id === null);
  const subcategoriesByParent = categories.reduce((acc, cat) => {
    if (cat.parent_id) {
      if (!acc[cat.parent_id]) acc[cat.parent_id] = [];
      acc[cat.parent_id].push(cat);
    }
    return acc;
  }, {} as Record<string, Category[]>);

  return (
    <div className="space-y-3">
      {rootCategories.map((category) => (
        <div key={category.id} className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`category-${category.id}`}
              checked={filters.categories.includes(category.slug)}
              onCheckedChange={() => toggleArrayFilter('categories', category.slug)}
            />
            <label
              htmlFor={`category-${category.id}`}
              className="text-sm font-medium leading-none cursor-pointer hover:text-primary"
            >
              {category.name}
            </label>
          </div>
          
          {/* Subcategories - properly nested */}
          {subcategoriesByParent[category.id] && (
            <div className="ml-6 space-y-2">
              {subcategoriesByParent[category.id].map((subcat) => (
                <div key={subcat.id} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`subcat-${subcat.id}`}
                      checked={filters.categories.includes(subcat.slug)}
                      onCheckedChange={() => toggleArrayFilter('categories', subcat.slug)}
                    />
                    <label
                      htmlFor={`subcat-${subcat.id}`}
                      className="text-xs text-muted-foreground cursor-pointer hover:text-foreground"
                    >
                      {subcat.name}
                    </label>
                  </div>
                  
                  {/* Sub-subcategories */}
                  {subcategoriesByParent[subcat.id] && (
                    <div className="ml-6 space-y-1">
                      {subcategoriesByParent[subcat.id].map((subsubcat) => (
                        <div key={subsubcat.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`subsubcat-${subsubcat.id}`}
                            checked={filters.categories.includes(subsubcat.slug)}
                            onCheckedChange={() => toggleArrayFilter('categories', subsubcat.slug)}
                          />
                          <label
                            htmlFor={`subsubcat-${subsubcat.id}`}
                            className="text-xs text-muted-foreground cursor-pointer hover:text-foreground pl-2"
                          >
                            {subsubcat.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CategoryFilter;
