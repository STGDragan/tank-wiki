
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SubcategorySelectorProps {
  parentCategorySlug: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  allowCustom?: boolean;
}

const SubcategorySelector = ({ 
  parentCategorySlug, 
  value, 
  onChange, 
  label = "Subcategory",
  allowCustom = true
}: SubcategorySelectorProps) => {
  const [isCustom, setIsCustom] = React.useState(false);

  // Fetch categories to find subcategories
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

  // Find the parent category and its subcategories
  const parentCategory = categories.find(cat => cat.slug === parentCategorySlug);
  const subcategories = categories.filter(cat => cat.parent_id === parentCategory?.id);

  // Check if current value is a predefined subcategory
  const isPredefinedValue = subcategories.some(sub => sub.slug === value);

  React.useEffect(() => {
    if (value && !isPredefinedValue && value !== "__custom__") {
      setIsCustom(true);
    } else {
      setIsCustom(false);
    }
  }, [value, isPredefinedValue]);

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "__custom__") {
      setIsCustom(true);
      onChange("");
    } else {
      setIsCustom(false);
      onChange(selectedValue);
    }
  };

  if (!parentCategory) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {!isCustom ? (
        <Select value={isPredefinedValue ? value : ""} onValueChange={handleSelectChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select subcategory..." />
          </SelectTrigger>
          <SelectContent>
            {subcategories.map((subcat) => (
              <SelectItem key={subcat.id} value={subcat.slug}>
                {subcat.name}
              </SelectItem>
            ))}
            {allowCustom && (
              <SelectItem value="__custom__">Custom subcategory...</SelectItem>
            )}
          </SelectContent>
        </Select>
      ) : (
        <div className="space-y-2">
          <Input
            placeholder="Enter custom subcategory"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              setIsCustom(false);
              onChange("");
            }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to predefined options
          </button>
        </div>
      )}
    </div>
  );
};

export default SubcategorySelector;
