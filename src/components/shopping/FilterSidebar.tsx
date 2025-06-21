
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Filter, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

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

const FilterSidebar = ({
  filters,
  onFiltersChange,
  categories,
  compatibilityTags,
  maxPrice,
  className,
  isMobile = false
}: FilterSidebarProps) => {
  const [openSections, setOpenSections] = useState({
    categories: true,
    tankTypes: true,
    price: true,
    tags: true,
    condition: true,
    sizeClass: true,
    temperament: true,
    difficulty: true,
    compatibility: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
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

  // Group categories by level for hierarchical display
  const rootCategories = categories.filter(cat => cat.level === 0);
  const subcategoriesByParent = categories.reduce((acc, cat) => {
    if (cat.level > 0 && cat.parent_id) {
      if (!acc[cat.parent_id]) acc[cat.parent_id] = [];
      acc[cat.parent_id].push(cat);
    }
    return acc;
  }, {} as Record<string, CategoryHierarchy[]>);

  // Group compatibility tags by type
  const compatibilityTagsByType = compatibilityTags.reduce((acc, tag) => {
    if (!acc[tag.tag_type]) acc[tag.tag_type] = [];
    acc[tag.tag_type].push(tag);
    return acc;
  }, {} as Record<string, CompatibilityTag[]>);

  const FilterSection = ({ title, isOpen, onToggle, children }: {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }) => (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="flex w-full justify-between p-0 h-auto font-medium text-left hover:bg-transparent"
          onClick={onToggle}
        >
          {title}
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 mt-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
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
        {/* Hierarchical Categories */}
        <FilterSection
          title="Categories"
          isOpen={openSections.categories}
          onToggle={() => toggleSection('categories')}
        >
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
                    className="text-sm font-medium leading-none cursor-pointer"
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
                          className="text-xs text-muted-foreground cursor-pointer"
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
        </FilterSection>

        {/* Tank Types */}
        <FilterSection
          title="Tank Types"
          isOpen={openSections.tankTypes}
          onToggle={() => toggleSection('tankTypes')}
        >
          <div className="space-y-2">
            {[
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
            ].map((tankType) => (
              <div key={tankType.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`tank-type-${tankType.value}`}
                  checked={filters.tankTypes.includes(tankType.value)}
                  onCheckedChange={() => toggleArrayFilter('tankTypes', tankType.value)}
                />
                <label
                  htmlFor={`tank-type-${tankType.value}`}
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {tankType.label}
                </label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection
          title="Price Range"
          isOpen={openSections.price}
          onToggle={() => toggleSection('price')}
        >
          <div className="space-y-4">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
              max={maxPrice}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}</span>
            </div>
          </div>
        </FilterSection>

        {/* Size Class */}
        <FilterSection
          title="Size Class"
          isOpen={openSections.sizeClass}
          onToggle={() => toggleSection('sizeClass')}
        >
          <div className="space-y-2">
            {[
              { value: 'nano', label: 'Nano' },
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' },
              { value: 'giant', label: 'Giant' }
            ].map((size) => (
              <div key={size.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`size-${size.value}`}
                  checked={filters.sizeClass.includes(size.value)}
                  onCheckedChange={() => toggleArrayFilter('sizeClass', size.value)}
                />
                <label
                  htmlFor={`size-${size.value}`}
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {size.label}
                </label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Temperament */}
        <FilterSection
          title="Temperament"
          isOpen={openSections.temperament}
          onToggle={() => toggleSection('temperament')}
        >
          <div className="space-y-2">
            {[
              { value: 'peaceful', label: 'Peaceful' },
              { value: 'semi_aggressive', label: 'Semi-Aggressive' },
              { value: 'aggressive', label: 'Aggressive' }
            ].map((temp) => (
              <div key={temp.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`temperament-${temp.value}`}
                  checked={filters.temperament.includes(temp.value)}
                  onCheckedChange={() => toggleArrayFilter('temperament', temp.value)}
                />
                <label
                  htmlFor={`temperament-${temp.value}`}
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {temp.label}
                </label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Difficulty Level */}
        <FilterSection
          title="Difficulty Level"
          isOpen={openSections.difficulty}
          onToggle={() => toggleSection('difficulty')}
        >
          <div className="space-y-2">
            {[
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'expert', label: 'Expert' }
            ].map((diff) => (
              <div key={diff.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`difficulty-${diff.value}`}
                  checked={filters.difficultyLevel.includes(diff.value)}
                  onCheckedChange={() => toggleArrayFilter('difficultyLevel', diff.value)}
                />
                <label
                  htmlFor={`difficulty-${diff.value}`}
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {diff.label}
                </label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Compatibility Tags */}
        <FilterSection
          title="Compatibility"
          isOpen={openSections.compatibility}
          onToggle={() => toggleSection('compatibility')}
        >
          <div className="space-y-4">
            {Object.entries(compatibilityTagsByType).map(([type, tags]) => (
              <div key={type} className="space-y-2">
                <h4 className="text-sm font-medium capitalize text-muted-foreground">
                  {type.replace('_', ' ')}
                </h4>
                <div className="space-y-2">
                  {tags.map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`compat-${tag.id}`}
                        checked={filters.compatibilityTags.includes(tag.id)}
                        onCheckedChange={() => toggleArrayFilter('compatibilityTags', tag.id)}
                      />
                      <label
                        htmlFor={`compat-${tag.id}`}
                        className="text-sm leading-none cursor-pointer"
                        title={tag.description}
                      >
                        {tag.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Condition */}
        <FilterSection
          title="Condition"
          isOpen={openSections.condition}
          onToggle={() => toggleSection('condition')}
        >
          <div className="space-y-2">
            {['New', 'Used', 'Refurbished'].map((condition) => (
              <div key={condition} className="flex items-center space-x-2">
                <Checkbox
                  id={`condition-${condition}`}
                  checked={filters.condition.includes(condition.toLowerCase())}
                  onCheckedChange={() => toggleArrayFilter('condition', condition.toLowerCase())}
                />
                <label
                  htmlFor={`condition-${condition}`}
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {condition}
                </label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Active Filters:</p>
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

