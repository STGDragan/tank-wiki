
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    categories: true,
    condition: true,
    tankTypes: true,
    compatibility: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
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

      <div className="space-y-4">
        <div>
          <button
            onClick={() => toggleSection('price')}
            className="flex w-full justify-between items-center text-left font-medium"
          >
            Price Range
            <span className={`transform transition-transform ${openSections.price ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          {openSections.price && (
            <div className="mt-3">
              <PriceRangeFilter
                filters={filters}
                onFiltersChange={onFiltersChange}
                maxPrice={maxPrice}
              />
            </div>
          )}
        </div>

        <Separator />

        <div>
          <button
            onClick={() => toggleSection('categories')}
            className="flex w-full justify-between items-center text-left font-medium"
          >
            Categories
            <span className={`transform transition-transform ${openSections.categories ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          {openSections.categories && (
            <div className="mt-3">
              <CategoryFilter
                categories={categories}
                filters={filters}
                onFiltersChange={onFiltersChange}
              />
            </div>
          )}
        </div>

        <Separator />

        <div>
          <button
            onClick={() => toggleSection('condition')}
            className="flex w-full justify-between items-center text-left font-medium"
          >
            Condition
            <span className={`transform transition-transform ${openSections.condition ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          {openSections.condition && (
            <div className="mt-3">
              <CheckboxFilter
                options={[
                  { value: "new", label: "New" },
                  { value: "used", label: "Used" },
                  { value: "refurbished", label: "Refurbished" }
                ]}
                filterKey="condition"
                filters={filters}
                onFiltersChange={onFiltersChange}
              />
            </div>
          )}
        </div>

        <Separator />

        <div>
          <button
            onClick={() => toggleSection('tankTypes')}
            className="flex w-full justify-between items-center text-left font-medium"
          >
            Tank Types
            <span className={`transform transition-transform ${openSections.tankTypes ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          {openSections.tankTypes && (
            <div className="mt-3">
              <CheckboxFilter
                options={[
                  { value: "freshwater", label: "Freshwater" },
                  { value: "saltwater", label: "Saltwater" },
                  { value: "reef", label: "Reef" },
                  { value: "planted", label: "Planted" },
                  { value: "nano", label: "Nano" }
                ]}
                filterKey="tankTypes"
                filters={filters}
                onFiltersChange={onFiltersChange}
              />
            </div>
          )}
        </div>

        <Separator />

        <div>
          <button
            onClick={() => toggleSection('compatibility')}
            className="flex w-full justify-between items-center text-left font-medium"
          >
            Compatibility
            <span className={`transform transition-transform ${openSections.compatibility ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          {openSections.compatibility && (
            <div className="mt-3">
              <CompatibilityTagsFilter
                compatibilityTags={compatibilityTags}
                filters={filters}
                onFiltersChange={onFiltersChange}
              />
            </div>
          )}
        </div>
      </div>
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
