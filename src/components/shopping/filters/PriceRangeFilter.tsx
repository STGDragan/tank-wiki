
import React from "react";
import { Slider } from "@/components/ui/slider";
import { FilterState } from "../types";

interface PriceRangeFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  maxPrice: number;
}

const PriceRangeFilter = ({ filters, onFiltersChange, maxPrice }: PriceRangeFilterProps) => {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
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
  );
};

export default PriceRangeFilter;
