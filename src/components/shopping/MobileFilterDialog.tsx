
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FilterSidebar, { FilterState } from "./FilterSidebar";
import { Tables } from "@/integrations/supabase/types";

type Category = Tables<'product_categories_new'>;
type CompatibilityTag = Tables<'compatibility_tags'>;

interface MobileFilterDialogProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: Category[];
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
