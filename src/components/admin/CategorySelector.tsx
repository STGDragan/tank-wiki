
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  label?: string;
  placeholder?: string;
}

const CategorySelector = ({ 
  value, 
  onChange, 
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

  const selectedCategory = categories.find(cat => cat.slug === value);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-96 overflow-y-auto">
          {rootCategories.map((category) => (
            <React.Fragment key={category.id}>
              <SelectItem value={category.slug} className="font-medium">
                {category.name}
              </SelectItem>
              
              {/* Subcategories - indented */}
              {subcategoriesByParent[category.id] && 
                subcategoriesByParent[category.id].map((subcat) => (
                  <React.Fragment key={subcat.id}>
                    <SelectItem value={subcat.slug} className="pl-6 text-sm">
                      {subcat.name}
                    </SelectItem>
                    
                    {/* Sub-subcategories - further indented */}
                    {subcategoriesByParent[subcat.id] && 
                      subcategoriesByParent[subcat.id].map((subsubcat) => (
                        <SelectItem key={subsubcat.id} value={subsubcat.slug} className="pl-10 text-xs">
                          {subsubcat.name}
                        </SelectItem>
                      ))
                    }
                  </React.Fragment>
                ))
              }
            </React.Fragment>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategorySelector;
