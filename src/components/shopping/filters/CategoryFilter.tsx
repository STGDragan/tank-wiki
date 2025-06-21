
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

  // Filter to only show equipment-related categories
  const equipmentCategories = categories.filter(cat => 
    cat.slug === 'aquarium-equipment' || 
    (cat.parent_id && categories.find(parent => parent.id === cat.parent_id)?.slug === 'aquarium-equipment')
  );

  const rootCategories = equipmentCategories.filter(cat => cat.level === 0);
  const subcategoriesByParent = equipmentCategories.reduce((acc, cat) => {
    if (cat.level > 0 && cat.parent_id) {
      if (!acc[cat.parent_id]) acc[cat.parent_id] = [];
      acc[cat.parent_id].push(cat);
    }
    return acc;
  }, {} as Record<string, CategoryHierarchy[]>);

  // If no equipment categories found, show a message
  if (equipmentCategories.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4 text-center">
        No equipment categories available
      </div>
    );
  }

  console.log('Equipment categories:', equipmentCategories);
  console.log('Root categories:', rootCategories);
  console.log('Subcategories by parent:', subcategoriesByParent);

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
      
      {/* Show subcategories even if no root category is found */}
      {rootCategories.length === 0 && equipmentCategories.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground mb-2">Equipment Categories</div>
          {equipmentCategories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={filters.categories.includes(category.slug)}
                onCheckedChange={() => toggleArrayFilter('categories', category.slug)}
              />
              <label
                htmlFor={`category-${category.id}`}
                className="text-sm leading-none cursor-pointer hover:text-primary"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
