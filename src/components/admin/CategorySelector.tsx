
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description?: string;
}

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  subcategory: string;
  onSubcategoryChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

const CategorySelector = ({ 
  value, 
  onChange, 
  subcategory,
  onSubcategoryChange,
  label = "Category",
  placeholder = "Select category..."
}: CategorySelectorProps) => {
  // Fetch categories using the same query as the shopping page
  const { data: categories = [] } = useQuery({
    queryKey: ["product-categories-new"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_categories_new")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Group categories by hierarchy (same logic as shopping filters)
  const rootCategories = categories.filter(cat => cat.parent_id === null);
  const subcategoriesByParent = categories.reduce((acc, cat) => {
    if (cat.parent_id) {
      if (!acc[cat.parent_id]) acc[cat.parent_id] = [];
      acc[cat.parent_id].push(cat);
    }
    return acc;
  }, {} as Record<string, Category[]>);

  const selectedCategory = categories.find(cat => cat.name === value);
  const availableSubcategories = selectedCategory ? subcategoriesByParent[selectedCategory.id] || [] : [];

  const handleSubcategoryChange = (newValue: string) => {
    // Handle the "none" case by setting empty string
    if (newValue === "__none__") {
      onSubcategoryChange("");
    } else {
      onSubcategoryChange(newValue);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{label}</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="max-h-96 overflow-y-auto">
            {rootCategories.map((category) => (
              <SelectItem key={category.id} value={category.name} className="font-medium">
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCategory && (
        <div className="space-y-2">
          <Label>Subcategory</Label>
          {availableSubcategories.length > 0 ? (
            <Select value={subcategory || "__none__"} onValueChange={handleSubcategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select subcategory (optional)" />
              </SelectTrigger>
              <SelectContent className="max-h-96 overflow-y-auto">
                <SelectItem value="__none__">None</SelectItem>
                {availableSubcategories.map((subcat) => (
                  <SelectItem key={subcat.id} value={subcat.name}>
                    {subcat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={subcategory}
              onChange={(e) => onSubcategoryChange(e.target.value)}
              placeholder="Enter custom subcategory (optional)"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
