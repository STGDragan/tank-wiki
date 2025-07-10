import React, { useState, useEffect } from "react";
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

interface HierarchicalCategorySelectorProps {
  value: {
    category: string;
    subcategory: string;
    subSubcategory: string;
  };
  onChange: (value: {
    category: string;
    subcategory: string;
    subSubcategory: string;
  }) => void;
  label?: string;
}

const HierarchicalCategorySelector = ({ 
  value, 
  onChange, 
  label = "Category Hierarchy" 
}: HierarchicalCategorySelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState(value.category);
  const [selectedSubcategory, setSelectedSubcategory] = useState(value.subcategory);
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState(value.subSubcategory);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["product-categories-hierarchy"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_categories_new")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  // Get root categories (level 1)
  const rootCategories = categories.filter(cat => cat.parent_id === null);
  
  // Get subcategories for selected category (level 2)
  const selectedCategoryData = categories.find(cat => cat.name === selectedCategory);
  const subcategories = selectedCategoryData 
    ? categories.filter(cat => cat.parent_id === selectedCategoryData.id)
    : [];
  
  // Get sub-subcategories for selected subcategory (level 3)
  const selectedSubcategoryData = categories.find(cat => cat.name === selectedSubcategory);
  const subSubcategories = selectedSubcategoryData 
    ? categories.filter(cat => cat.parent_id === selectedSubcategoryData.id)
    : [];

  // Update parent component when values change
  useEffect(() => {
    onChange({
      category: selectedCategory,
      subcategory: selectedSubcategory,
      subSubcategory: selectedSubSubcategory
    });
  }, [selectedCategory, selectedSubcategory, selectedSubSubcategory, onChange]);

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedSubcategory(""); // Reset subcategory
    setSelectedSubSubcategory(""); // Reset sub-subcategory
  };

  const handleSubcategoryChange = (subcategoryName: string) => {
    setSelectedSubcategory(subcategoryName);
    setSelectedSubSubcategory(""); // Reset sub-subcategory
  };

  const handleSubSubcategoryChange = (subSubcategoryName: string) => {
    setSelectedSubSubcategory(subSubcategoryName);
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {/* Level 1: Main Category */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Main Category</Label>
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select main category..." />
          </SelectTrigger>
          <SelectContent className="max-h-96 overflow-y-auto">
            {rootCategories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Level 2: Subcategory */}
      {selectedCategory && subcategories.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Subcategory</Label>
          <Select value={selectedSubcategory} onValueChange={handleSubcategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select subcategory..." />
            </SelectTrigger>
            <SelectContent className="max-h-96 overflow-y-auto">
              <SelectItem value="">None</SelectItem>
              {subcategories.map((subcat) => (
                <SelectItem key={subcat.id} value={subcat.name}>
                  {subcat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Level 3: Sub-subcategory */}
      {selectedSubcategory && subSubcategories.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Sub-subcategory</Label>
          <Select value={selectedSubSubcategory} onValueChange={handleSubSubcategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select sub-subcategory..." />
            </SelectTrigger>
            <SelectContent className="max-h-96 overflow-y-auto">
              <SelectItem value="">None</SelectItem>
              {subSubcategories.map((subsubcat) => (
                <SelectItem key={subsubcat.id} value={subsubcat.name}>
                  {subsubcat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default HierarchicalCategorySelector;