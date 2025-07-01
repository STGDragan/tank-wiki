
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import FilterSection from "./filters/FilterSection";
import CategoryFilter from "./filters/CategoryFilter";
import CheckboxFilter from "./filters/CheckboxFilter";
import PriceRangeFilter from "./filters/PriceRangeFilter";
import CompatibilityTagsFilter from "./filters/CompatibilityTagsFilter";
import { Tables } from "@/integrations/supabase/types";

export interface FilterState {
  categories: string[];
  subcategories: string[];
  priceRange: [number, number];
  tags: string[];
  condition: string[];
  tankTypes: string[];
  sizeClass: string[];
  temperament: string[];
  difficultyLevel: string[];
  compatibilityTags: string[];
}

type Category = Tables<'product_categories_new'>;
type CompatibilityTag = Tables<'compatibility_tags'>;

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: Category[];
  compatibilityTags: CompatibilityTag[];
  maxPrice: number;
  isMobile?: boolean;
}

const FilterSidebar = ({ 
  filters, 
  onFiltersChange, 
  categories, 
  compatibilityTags, 
  maxPrice,
  isMobile = false 
}: FilterSidebarProps) => {
  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    onFiltersChange({ ...filters, [key]: newArray });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      subcategories: [],
      priceRange: [0, maxPrice],
      tags: [],
      condition: [],
      tankTypes: [],
      sizeClass: [],
      temperament: [],
      difficultyLevel: [],
      compatibilityTags: [],
    });
  };

  const content = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button
          onClick={clearAllFilters}
          className="text-sm text-primary hover:text-primary/80"
        >
          Clear All
        </button>
      </div>

      <FilterSection title="Price Range">
        <PriceRangeFilter
          value={filters.priceRange}
          onChange={(value) => onFiltersChange({ ...filters, priceRange: value })}
          max={maxPrice}
        />
      </FilterSection>

      <Separator />

      <FilterSection title="Categories">
        <CategoryFilter
          categories={categories}
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
      </FilterSection>

      <Separator />

      <FilterSection title="Condition">
        <CheckboxFilter
          options={[
            { value: "new", label: "New" },
            { value: "used", label: "Used" },
            { value: "refurbished", label: "Refurbished" }
          ]}
          selectedValues={filters.condition}
          onToggle={(value) => toggleArrayFilter('condition', value)}
        />
      </FilterSection>

      <Separator />

      <FilterSection title="Tank Types">
        <CheckboxFilter
          options={[
            { value: "freshwater", label: "Freshwater" },
            { value: "saltwater", label: "Saltwater" },
            { value: "reef", label: "Reef" },
            { value: "planted", label: "Planted" },
            { value: "nano", label: "Nano" }
          ]}
          selectedValues={filters.tankTypes}
          onToggle={(value) => toggleArrayFilter('tankTypes', value)}
        />
      </FilterSection>

      <Separator />

      <FilterSection title="Compatibility">
        <CompatibilityTagsFilter
          compatibilityTags={compatibilityTags}
          selectedTags={filters.compatibilityTags}
          onToggle={(value) => toggleArrayFilter('compatibilityTags', value)}
        />
      </FilterSection>
    </div>
  );

  if (isMobile) {
    return content;
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Filters</CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};

export default FilterSidebar;
