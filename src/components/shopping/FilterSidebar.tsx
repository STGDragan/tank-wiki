
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Filter, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import FilterSection from "./filters/FilterSection";
import CategoryFilter from "./filters/CategoryFilter";
import PriceRangeFilter from "./filters/PriceRangeFilter";
import CheckboxFilter from "./filters/CheckboxFilter";
import CompatibilityTagsFilter from "./filters/CompatibilityTagsFilter";

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

interface CategoryHierarchy {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  level: number;
  path: string[];
}

interface CompatibilityTag {
  id: string;
  name: string;
  description: string;
  tag_type: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: CategoryHierarchy[];
  compatibilityTags: CompatibilityTag[];
  maxPrice: number;
  className?: string;
  isMobile?: boolean;
}

// Filter options constants
const TANK_TYPE_OPTIONS = [
  { value: 'freshwater_community', label: 'Freshwater Community' },
  { value: 'african_cichlid', label: 'African Cichlid' },
  { value: 'planted_low_tech', label: 'Planted (Low Tech)' },
  { value: 'planted_high_tech', label: 'Planted (High Tech)' },
  { value: 'brackish', label: 'Brackish' },
  { value: 'freshwater_nano', label: 'Freshwater Nano' },
  { value: 'saltwater_fo', label: 'Saltwater Fish Only' },
  { value: 'fowlr', label: 'FOWLR' },
  { value: 'reef_soft_coral', label: 'Reef (Soft Coral)' },
  { value: 'reef_lps', label: 'Reef (LPS)' },
  { value: 'reef_sps', label: 'Reef (SPS)' },
  { value: 'reef_mixed', label: 'Reef (Mixed)' }
];

const SIZE_CLASS_OPTIONS = [
  { value: 'nano', label: 'Nano' },
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'giant', label: 'Giant' }
];

const TEMPERAMENT_OPTIONS = [
  { value: 'peaceful', label: 'Peaceful' },
  { value: 'semi_aggressive', label: 'Semi-Aggressive' },
  { value: 'aggressive', label: 'Aggressive' }
];

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' }
];

const CONDITION_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
  { value: 'refurbished', label: 'Refurbished' }
];

const FilterSidebar = ({
  filters,
  onFiltersChange,
  categories,
  compatibilityTags,
  maxPrice,
  className,
  isMobile = false
}: FilterSidebarProps) => {
  // All sections default to closed
  const [openSections, setOpenSections] = useState({
    equipment: false,
    tankTypes: false,
    price: false,
    tags: false,
    condition: false,
    sizeClass: false,
    temperament: false,
    difficulty: false,
    compatibility: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const resetFilters = () => {
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
      compatibilityTags: []
    });
  };

  const hasActiveFilters = Object.values(filters).some(filter => 
    Array.isArray(filter) 
      ? filter.length > 0 
      : (filter as [number, number])[0] > 0 || (filter as [number, number])[1] < maxPrice
  );

  return (
    <Card className={cn("w-full bg-background border border-border", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg text-foreground">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="h-8 px-2 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Equipment with ScrollArea when expanded */}
        <FilterSection
          title="Equipment"
          isOpen={openSections.equipment}
          onToggle={() => toggleSection('equipment')}
        >
          <ScrollArea className="h-64">
            <CategoryFilter
              categories={categories}
              filters={filters}
              onFiltersChange={onFiltersChange}
            />
          </ScrollArea>
        </FilterSection>

        {/* Price Range */}
        <FilterSection
          title="Price Range"
          isOpen={openSections.price}
          onToggle={() => toggleSection('price')}
        >
          <PriceRangeFilter
            filters={filters}
            onFiltersChange={onFiltersChange}
            maxPrice={maxPrice}
          />
        </FilterSection>

        {/* Tank Types */}
        <FilterSection
          title="Tank Types"
          isOpen={openSections.tankTypes}
          onToggle={() => toggleSection('tankTypes')}
        >
          <ScrollArea className="h-48">
            <CheckboxFilter
              options={TANK_TYPE_OPTIONS}
              filterKey="tankTypes"
              filters={filters}
              onFiltersChange={onFiltersChange}
            />
          </ScrollArea>
        </FilterSection>

        {/* Size Class */}
        <FilterSection
          title="Size Class"
          isOpen={openSections.sizeClass}
          onToggle={() => toggleSection('sizeClass')}
        >
          <CheckboxFilter
            options={SIZE_CLASS_OPTIONS}
            filterKey="sizeClass"
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        </FilterSection>

        {/* Temperament */}
        <FilterSection
          title="Temperament"
          isOpen={openSections.temperament}
          onToggle={() => toggleSection('temperament')}
        >
          <CheckboxFilter
            options={TEMPERAMENT_OPTIONS}
            filterKey="temperament"
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        </FilterSection>

        {/* Difficulty Level */}
        <FilterSection
          title="Difficulty Level"
          isOpen={openSections.difficulty}
          onToggle={() => toggleSection('difficulty')}
        >
          <CheckboxFilter
            options={DIFFICULTY_OPTIONS}
            filterKey="difficultyLevel"
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        </FilterSection>

        {/* Compatibility Tags */}
        <FilterSection
          title="Compatibility"
          isOpen={openSections.compatibility}
          onToggle={() => toggleSection('compatibility')}
        >
          <ScrollArea className="h-48">
            <CompatibilityTagsFilter
              compatibilityTags={compatibilityTags}
              filters={filters}
              onFiltersChange={onFiltersChange}
            />
          </ScrollArea>
        </FilterSection>

        {/* Condition */}
        <FilterSection
          title="Condition"
          isOpen={openSections.condition}
          onToggle={() => toggleSection('condition')}
        >
          <CheckboxFilter
            options={CONDITION_OPTIONS}
            filterKey="condition"
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        </FilterSection>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2 text-foreground">Active Filters:</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(filters).flatMap(([key, values]) => {
                if (key === 'priceRange') {
                  const [min, max] = values as [number, number];
                  if (min > 0 || max < maxPrice) {
                    return [<Badge key="price" variant="secondary" className="text-xs">
                      ${min}-${max}
                    </Badge>];
                  }
                  return [];
                }
                return (values as string[]).map(value => (
                  <Badge key={`${key}-${value}`} variant="secondary" className="text-xs">
                    {value.replace('_', ' ')}
                  </Badge>
                ));
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FilterSidebar;
