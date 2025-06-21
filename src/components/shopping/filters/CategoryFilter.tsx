
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterState } from "../FilterSidebar";

interface CategoryHierarchy {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  level: number;
  path: string[];
}

interface CategoryFilterProps {
  categories: CategoryHierarchy[];
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

  const rootCategories = categories.filter(cat => cat.level === 0);
  const subcategoriesByParent = categories.reduce((acc, cat) => {
    if (cat.level > 0 && cat.parent_id) {
      if (!acc[cat.parent_id]) acc[cat.parent_id] = [];
      acc[cat.parent_id].push(cat);
    }
    return acc;
  }, {} as Record<string, CategoryHierarchy[]>);

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
          {/* Subcategories */}
          {subcategoriesByParent[category.id] && (
            <div className="ml-6 space-y-2">
              {subcategoriesByParent[category.id].map((subcat) => (
                <div key={subcat.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`subcat-${subcat.id}`}
                    checked={filters.subcategories.includes(subcat.slug)}
                    onCheckedChange={() => toggleArrayFilter('subcategories', subcat.slug)}
                  />
                  <label
                    htmlFor={`subcat-${subcat.id}`}
                    className="text-xs text-muted-foreground cursor-pointer hover:text-foreground"
                  >
                    {subcat.name}
                  </label>
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
