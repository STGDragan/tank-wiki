import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import CategoryFilter from "./filters/CategoryFilter";
import CheckboxFilter from "./filters/CheckboxFilter";
import PriceRangeFilter from "./filters/PriceRangeFilter";
import CompatibilityTagsFilter from "./filters/CompatibilityTagsFilter";
import { FilterState, Category } from "./types";
import { Tables } from "@/integrations/supabase/types";

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
    price: false,
    categories: false,
    condition: false,
    tankTypes: false,
    compatibility: false,
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button
          onClick={clearAllFilters}
          className="text-sm text-primary hover:text-primary/80"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-3">
        {/* Price Range Filter */}
        <Collapsible 
          open={openSections.price} 
          onOpenChange={() => toggleSection('price')}
        >
          <CollapsibleTrigger className="flex w-full justify-between items-center p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
            <span className="font-medium">Price Range</span>
            <ChevronDown 
              className={`h-4 w-4 transition-transform duration-200 ${
                openSections.price ? 'transform rotate-180' : ''
              }`} 
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 p-3 border rounded-lg bg-background/50">
            <PriceRangeFilter
              filters={filters}
              onFiltersChange={onFiltersChange}
              maxPrice={maxPrice}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Categories Filter */}
        <Collapsible 
          open={openSections.categories} 
          onOpenChange={() => toggleSection('categories')}
        >
          <CollapsibleTrigger className="flex w-full justify-between items-center p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
            <span className="font-medium">Categories</span>
            <ChevronDown 
              className={`h-4 w-4 transition-transform duration-200 ${
                openSections.categories ? 'transform rotate-180' : ''
              }`} 
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 p-3 border rounded-lg bg-background/50">
            <CategoryFilter
              categories={categories}
              filters={filters}
              onFiltersChange={onFiltersChange}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Condition Filter */}
        <Collapsible 
          open={openSections.condition} 
          onOpenChange={() => toggleSection('condition')}
        >
          <CollapsibleTrigger className="flex w-full justify-between items-center p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
            <span className="font-medium">Condition</span>
            <ChevronDown 
              className={`h-4 w-4 transition-transform duration-200 ${
                openSections.condition ? 'transform rotate-180' : ''
              }`} 
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 p-3 border rounded-lg bg-background/50">
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
          </CollapsibleContent>
        </Collapsible>

        {/* Tank Types Filter */}
        <Collapsible 
          open={openSections.tankTypes} 
          onOpenChange={() => toggleSection('tankTypes')}
        >
          <CollapsibleTrigger className="flex w-full justify-between items-center p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
            <span className="font-medium">Tank Types</span>
            <ChevronDown 
              className={`h-4 w-4 transition-transform duration-200 ${
                openSections.tankTypes ? 'transform rotate-180' : ''
              }`} 
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 p-3 border rounded-lg bg-background/50">
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
          </CollapsibleContent>
        </Collapsible>

        {/* Compatibility Filter */}
        <Collapsible 
          open={openSections.compatibility} 
          onOpenChange={() => toggleSection('compatibility')}
        >
          <CollapsibleTrigger className="flex w-full justify-between items-center p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
            <span className="font-medium">Compatibility</span>
            <ChevronDown 
              className={`h-4 w-4 transition-transform duration-200 ${
                openSections.compatibility ? 'transform rotate-180' : ''
              }`} 
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 p-3 border rounded-lg bg-background/50">
            <CompatibilityTagsFilter
              compatibilityTags={compatibilityTags}
              filters={filters}
              onFiltersChange={onFiltersChange}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );

  if (isMobile) {
    return content;
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">Filters</CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};

export default FilterSidebar;
