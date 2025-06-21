
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import FilterSidebar, { FilterState } from "./FilterSidebar";

interface MobileFilterDialogProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: string[];
  subcategories: string[];
  maxPrice: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MobileFilterDialog = ({
  filters,
  onFiltersChange,
  categories,
  subcategories,
  maxPrice,
  open,
  onOpenChange
}: MobileFilterDialogProps) => {
  const activeFilterCount = 
    filters.categories.length + 
    filters.subcategories.length + 
    filters.tags.length + 
    filters.condition.length +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Products</DialogTitle>
          <DialogDescription>
            Narrow down your search with these filters.
          </DialogDescription>
        </DialogHeader>
        <FilterSidebar
          filters={filters}
          onFiltersChange={onFiltersChange}
          categories={categories}
          subcategories={subcategories}
          maxPrice={maxPrice}
          isMobile={true}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MobileFilterDialog;
