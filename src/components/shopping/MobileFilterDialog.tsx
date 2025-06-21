
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

interface MobileFilterDialogProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: CategoryHierarchy[];
  compatibilityTags: CompatibilityTag[];
  maxPrice: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MobileFilterDialog = ({
  filters,
  onFiltersChange,
  categories,
  compatibilityTags,
  maxPrice,
  open,
  onOpenChange
}: MobileFilterDialogProps) => {
  const activeFilterCount = Object.values(filters).reduce((count, filter) => {
    if (Array.isArray(filter)) {
      return count + filter.length;
    }
    // Handle price range
    const [min, max] = filter as [number, number];
    return count + (min > 0 || max < maxPrice ? 1 : 0);
  }, 0);

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
          compatibilityTags={compatibilityTags}
          maxPrice={maxPrice}
          isMobile={true}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MobileFilterDialog;

