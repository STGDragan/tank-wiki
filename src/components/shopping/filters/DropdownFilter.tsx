import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterState, Category } from "../types";

interface DropdownFilterProps {
  categories: Category[];
  parentCategorySlug: string;
  filterKey: keyof FilterState;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  placeholder: string;
}

const DropdownFilter = ({ 
  categories, 
  parentCategorySlug, 
  filterKey, 
  filters, 
  onFiltersChange,
  placeholder 
}: DropdownFilterProps) => {
  // Find the parent category
  const parentCategory = categories.find(cat => cat.slug === parentCategorySlug);
  
  // Get subcategories for the parent category
  const subcategories = categories.filter(cat => cat.parent_id === parentCategory?.id);
  
  // Get current selection
  const currentSelection = filters[filterKey] as string[];
  const selectedValue = currentSelection.length > 0 ? currentSelection[0] : "";

  const handleSelectionChange = (value: string) => {
    if (value === "all" || value === "") {
      // Clear the filter
      onFiltersChange({ ...filters, [filterKey]: [] });
    } else {
      // Set the selected subcategory
      onFiltersChange({ ...filters, [filterKey]: [value] });
    }
  };

  if (!parentCategory || subcategories.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No subcategories available
      </div>
    );
  }

  return (
    <Select value={selectedValue} onValueChange={handleSelectionChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-background border border-border shadow-lg">
        <SelectItem value="all" className="hover:bg-muted">
          All {parentCategory.name}
        </SelectItem>
        {subcategories.map((subcat) => (
          <SelectItem 
            key={subcat.id} 
            value={subcat.slug}
            className="hover:bg-muted"
          >
            {subcat.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DropdownFilter;