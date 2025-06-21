
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
}

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: string[];
  subcategories: string[];
  maxPrice: number;
  className?: string;
  isMobile?: boolean;
}

const FilterSidebar = ({
  filters,
  onFiltersChange,
  categories,
  subcategories,
  maxPrice,
  className,
  isMobile = false
}: FilterSidebarProps) => {
  const [openSections, setOpenSections] = useState({
    categories: true,
    subcategories: true,
    price: true,
    tags: true,
    condition: true
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
      condition: []
    });
  };

  const hasActiveFilters = filters.categories.length > 0 || 
    filters.subcategories.length > 0 || 
    filters.tags.length > 0 || 
    filters.condition.length > 0 ||
    filters.priceRange[0] > 0 || 
    filters.priceRange[1] < maxPrice;

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
        {/* Categories */}
        <FilterSection
          title="Categories"
          isOpen={openSections.categories}
          onToggle={() => toggleSection('categories')}
        >
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={() => toggleArrayFilter('categories', category)}
                />
                <label
                  htmlFor={`category-${category}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <FilterSection
            title="Subcategories"
            isOpen={openSections.subcategories}
            onToggle={() => toggleSection('subcategories')}
          >
            <div className="space-y-2">
              {subcategories.map((subcategory) => (
                <div key={subcategory} className="flex items-center space-x-2">
                  <Checkbox
                    id={`subcategory-${subcategory}`}
                    checked={filters.subcategories.includes(subcategory)}
                    onCheckedChange={() => toggleArrayFilter('subcategories', subcategory)}
                  />
                  <label
                    htmlFor={`subcategory-${subcategory}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {subcategory}
                  </label>
                </div>
              ))}
            </div>
          </FilterSection>
        )}

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

        {/* Tags */}
        <FilterSection
          title="Product Tags"
          isOpen={openSections.tags}
          onToggle={() => toggleSection('tags')}
        >
          <div className="space-y-2">
            {['Featured', 'On Sale', 'Recommended'].map((tag) => (
              <div key={tag} className="flex items-center space-x-2">
                <Checkbox
                  id={`tag-${tag}`}
                  checked={filters.tags.includes(tag)}
                  onCheckedChange={() => toggleArrayFilter('tags', tag)}
                />
                <label
                  htmlFor={`tag-${tag}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {tag}
                </label>
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
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
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
              {filters.categories.map(cat => (
                <Badge key={cat} variant="secondary" className="text-xs">
                  {cat}
                </Badge>
              ))}
              {filters.subcategories.map(sub => (
                <Badge key={sub} variant="secondary" className="text-xs">
                  {sub}
                </Badge>
              ))}
              {filters.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {filters.condition.map(cond => (
                <Badge key={cond} variant="secondary" className="text-xs">
                  {cond}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FilterSidebar;
