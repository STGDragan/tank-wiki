import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ProductSubcategoryManagerProps {
  subcategories: string[];
  onSubcategoriesChange: (subcategories: string[]) => void;
}

export const ProductSubcategoryManager = ({ subcategories, onSubcategoriesChange }: ProductSubcategoryManagerProps) => {
  const removeSubcategory = (index: number) => {
    onSubcategoriesChange(subcategories.filter((_, i) => i !== index));
  };

  if (subcategories.length === 0) return null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Selected Subcategories</label>
      <div className="flex flex-wrap gap-2">
        {subcategories.map((subcategory, index) => (
          <div key={index} className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-md">
            <span className="text-sm">{subcategory}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => removeSubcategory(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};