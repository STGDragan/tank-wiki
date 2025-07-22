import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import CategoryFilter from "./filters/CategoryFilter";
import CheckboxFilter from "./filters/CheckboxFilter";
import DropdownFilter from "./filters/DropdownFilter";
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
    aquariumEquipment: false,
    consumables: false,
    livestock: false,
    tankTypes: false,
    compatibility: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Helper function to check if a section has active filters
  const hasActiveFilters = (section: string): boolean => {
    switch (section) {
      case 'price':
        return filters.priceRange[0] !== 0 || filters.priceRange[1] !== maxPrice;
      case 'aquariumEquipment':
        const equipmentParent = categories.find(cat => cat.slug === 'aquarium-equipment');
        if (!equipmentParent) return false;
        const equipmentSubcats = categories.filter(cat => cat.parent_id === equipmentParent.id);
        return equipmentSubcats.some(subcat => filters.categories.includes(subcat.slug));
      case 'consumables':
        const consumablesParent = categories.find(cat => cat.slug === 'consumables');
        if (!consumablesParent) return false;
        const consumablesSubcats = categories.filter(cat => cat.parent_id === consumablesParent.id);
        const consumablesSubSubcats = categories.filter(cat => 
          consumablesSubcats.some(subcat => subcat.id === cat.parent_id)
        );
        return [...consumablesSubcats, ...consumablesSubSubcats].some(cat => filters.categories.includes(cat.slug));
      case 'livestock':
        const livestockParent = categories.find(cat => cat.slug === 'livestock');
        if (!livestockParent) return false;
        const livestockSubcats = categories.filter(cat => cat.parent_id === livestockParent.id);
        const livestockSubSubcats = categories.filter(cat => 
          livestockSubcats.some(subcat => subcat.id === cat.parent_id)
        );
        return [...livestockSubcats, ...livestockSubSubcats].some(cat => filters.categories.includes(cat.slug));
      case 'tankTypes':
        return filters.tankTypes.length > 0;
      case 'compatibility':
        return filters.compatibilityTags.length > 0;
      default:
        return false;
    }
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
          open={openSections.price || hasActiveFilters('price')} 
          onOpenChange={hasActiveFilters('price') ? undefined : () => toggleSection('price')}
        >
          <CollapsibleTrigger 
            className={`flex w-full justify-between items-center p-3 rounded-lg border bg-background transition-colors ${
              hasActiveFilters('price') ? 'cursor-default' : 'hover:bg-muted/50'
            }`}
            disabled={hasActiveFilters('price')}
          >
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

        {/* Aquarium Equipment Checkboxes */}
        <Collapsible 
          open={openSections.aquariumEquipment || hasActiveFilters('aquariumEquipment')} 
          onOpenChange={hasActiveFilters('aquariumEquipment') ? undefined : () => toggleSection('aquariumEquipment')}
        >
          <CollapsibleTrigger 
            className={`flex w-full justify-between items-center p-3 rounded-lg border bg-background transition-colors ${
              hasActiveFilters('aquariumEquipment') ? 'cursor-default' : 'hover:bg-muted/50'
            }`}
            disabled={hasActiveFilters('aquariumEquipment')}
          >
            <span className="font-medium">Aquarium Equipment</span>
            <ChevronDown 
              className={`h-4 w-4 transition-transform duration-200 ${
                (openSections.aquariumEquipment || hasActiveFilters('aquariumEquipment')) ? 'transform rotate-180' : ''
              }`} 
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 p-3 border rounded-lg bg-background/50">
            <CheckboxFilter
              options={
                categories
                  .find(cat => cat.slug === 'aquarium-equipment')
                  ? categories
                      .filter(cat => cat.parent_id === categories.find(parent => parent.slug === 'aquarium-equipment')?.id)
                      .map(subcat => ({ value: subcat.slug, label: subcat.name }))
                  : []
              }
              filterKey="categories"
              filters={filters}
              onFiltersChange={onFiltersChange}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Consumables Checkboxes */}
        <Collapsible 
          open={openSections.consumables || hasActiveFilters('consumables')} 
          onOpenChange={hasActiveFilters('consumables') ? undefined : () => toggleSection('consumables')}
        >
          <CollapsibleTrigger 
            className={`flex w-full justify-between items-center p-3 rounded-lg border bg-background transition-colors ${
              hasActiveFilters('consumables') ? 'cursor-default' : 'hover:bg-muted/50'
            }`}
            disabled={hasActiveFilters('consumables')}
          >
            <span className="font-medium">Consumables</span>
            <ChevronDown 
              className={`h-4 w-4 transition-transform duration-200 ${
                (openSections.consumables || hasActiveFilters('consumables')) ? 'transform rotate-180' : ''
              }`} 
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 p-3 border rounded-lg bg-background/50">
            <CheckboxFilter
              options={(() => {
                const parentCategory = categories.find(cat => cat.slug === 'consumables');
                if (!parentCategory) return [];
                
                // Get direct subcategories
                const subcategories = categories.filter(cat => cat.parent_id === parentCategory.id);
                
                // Get sub-subcategories
                const subSubcategories = categories.filter(cat => 
                  subcategories.some(subcat => subcat.id === cat.parent_id)
                );
                
                // Combine all categories and map to options
                return [...subcategories, ...subSubcategories]
                  .map(cat => ({ value: cat.slug, label: cat.name }));
              })()}
              filterKey="categories"
              filters={filters}
              onFiltersChange={onFiltersChange}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Livestock Checkboxes */}
        <Collapsible 
          open={openSections.livestock || hasActiveFilters('livestock')} 
          onOpenChange={hasActiveFilters('livestock') ? undefined : () => toggleSection('livestock')}
        >
          <CollapsibleTrigger 
            className={`flex w-full justify-between items-center p-3 rounded-lg border bg-background transition-colors ${
              hasActiveFilters('livestock') ? 'cursor-default' : 'hover:bg-muted/50'
            }`}
            disabled={hasActiveFilters('livestock')}
          >
            <span className="font-medium">Livestock</span>
            <ChevronDown 
              className={`h-4 w-4 transition-transform duration-200 ${
                (openSections.livestock || hasActiveFilters('livestock')) ? 'transform rotate-180' : ''
              }`} 
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 p-3 border rounded-lg bg-background/50">
            <CheckboxFilter
              options={(() => {
                const parentCategory = categories.find(cat => cat.slug === 'livestock');
                if (!parentCategory) return [];
                
                // Get direct subcategories
                const subcategories = categories.filter(cat => cat.parent_id === parentCategory.id);
                
                // Get sub-subcategories
                const subSubcategories = categories.filter(cat => 
                  subcategories.some(subcat => subcat.id === cat.parent_id)
                );
                
                // Combine all categories and map to options
                return [...subcategories, ...subSubcategories]
                  .map(cat => ({ value: cat.slug, label: cat.name }));
              })()}
              filterKey="categories"
              filters={filters}
              onFiltersChange={onFiltersChange}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Tank Types Filter */}
        <Collapsible 
          open={openSections.tankTypes || hasActiveFilters('tankTypes')} 
          onOpenChange={hasActiveFilters('tankTypes') ? undefined : () => toggleSection('tankTypes')}
        >
          <CollapsibleTrigger 
            className={`flex w-full justify-between items-center p-3 rounded-lg border bg-background transition-colors ${
              hasActiveFilters('tankTypes') ? 'cursor-default' : 'hover:bg-muted/50'
            }`}
            disabled={hasActiveFilters('tankTypes')}
          >
            <span className="font-medium">Tank Types</span>
            <ChevronDown 
              className={`h-4 w-4 transition-transform duration-200 ${
                (openSections.tankTypes || hasActiveFilters('tankTypes')) ? 'transform rotate-180' : ''
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
          open={openSections.compatibility || hasActiveFilters('compatibility')} 
          onOpenChange={hasActiveFilters('compatibility') ? undefined : () => toggleSection('compatibility')}
        >
          <CollapsibleTrigger 
            className={`flex w-full justify-between items-center p-3 rounded-lg border bg-background transition-colors ${
              hasActiveFilters('compatibility') ? 'cursor-default' : 'hover:bg-muted/50'
            }`}
            disabled={hasActiveFilters('compatibility')}
          >
            <span className="font-medium">Compatibility</span>
            <ChevronDown 
              className={`h-4 w-4 transition-transform duration-200 ${
                (openSections.compatibility || hasActiveFilters('compatibility')) ? 'transform rotate-180' : ''
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
