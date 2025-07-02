
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CategoryAssignment {
  categoryId: string;
  categoryName: string;
  subcategory: string;
}

interface MultiCategorySelectorProps {
  productId?: string;
  value: CategoryAssignment[];
  onChange: (assignments: CategoryAssignment[]) => void;
}

const MultiCategorySelector = ({ productId, value, onChange }: MultiCategorySelectorProps) => {
  const [newCategory, setNewCategory] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories
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

  // Fetch predefined subcategories
  const { data: predefinedSubcategories = [] } = useQuery({
    queryKey: ["predefined-subcategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("predefined_subcategories")
        .select("*, product_categories_new!inner(name)")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Create new category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const { data, error } = await supabase
        .from("product_categories_new")
        .insert([{ name, slug }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (newCategoryData) => {
      queryClient.invalidateQueries({ queryKey: ["product-categories-new"] });
      toast({ title: "Category created", description: `${newCategoryData.name} has been created.` });
      setNewCategory("");
      setIsCreatingCategory(false);
      // Add the new category to assignments
      const newAssignment: CategoryAssignment = {
        categoryId: newCategoryData.id,
        categoryName: newCategoryData.name,
        subcategory: ""
      };
      onChange([...value, newAssignment]);
    },
    onError: (error: Error) => {
      toast({ title: "Error creating category", description: error.message, variant: "destructive" });
    }
  });

  const addCategoryAssignment = () => {
    const newAssignment: CategoryAssignment = {
      categoryId: "",
      categoryName: "",
      subcategory: ""
    };
    onChange([...value, newAssignment]);
  };

  const removeCategoryAssignment = (index: number) => {
    const newAssignments = value.filter((_, i) => i !== index);
    onChange(newAssignments);
  };

  const updateCategoryAssignment = (index: number, field: keyof CategoryAssignment, newValue: string) => {
    const newAssignments = [...value];
    if (field === 'categoryId') {
      const category = categories.find(c => c.id === newValue);
      newAssignments[index] = {
        ...newAssignments[index],
        categoryId: newValue,
        categoryName: category?.name || ""
      };
    } else {
      newAssignments[index] = {
        ...newAssignments[index],
        [field]: newValue
      };
    }
    onChange(newAssignments);
  };

  const getSubcategoriesForCategory = (categoryId: string) => {
    return predefinedSubcategories.filter(sub => sub.category_id === categoryId);
  };

  const handleCreateCategory = () => {
    if (newCategory.trim()) {
      createCategoryMutation.mutate(newCategory.trim());
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Categories & Subcategories</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCategoryAssignment}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Category
        </Button>
      </div>

      {value.map((assignment, index) => (
        <div key={index} className="flex gap-2 items-end p-4 border rounded-lg">
          <div className="flex-1 space-y-2">
            <Label>Category</Label>
            <Select
              value={assignment.categoryId}
              onValueChange={(value) => updateCategoryAssignment(index, 'categoryId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 space-y-2">
            <Label>Subcategory</Label>
            <div className="relative">
              <Select
                value={assignment.subcategory}
                onValueChange={(value) => updateCategoryAssignment(index, 'subcategory', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select or type subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {assignment.categoryId && getSubcategoriesForCategory(assignment.categoryId).map((sub) => (
                    <SelectItem key={sub.id} value={sub.name}>
                      {sub.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom__">Type custom subcategory...</SelectItem>
                </SelectContent>
              </Select>
              {assignment.subcategory === "__custom__" && (
                <Input
                  className="mt-2"
                  placeholder="Enter custom subcategory"
                  onChange={(e) => updateCategoryAssignment(index, 'subcategory', e.target.value)}
                />
              )}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeCategoryAssignment(index)}
            disabled={value.length === 1}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {/* Create new category section */}
      <div className="border-t pt-4">
        {!isCreatingCategory ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsCreatingCategory(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Create New Category
          </Button>
        ) : (
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label>New Category Name</Label>
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter new category name"
              />
            </div>
            <Button
              type="button"
              onClick={handleCreateCategory}
              disabled={!newCategory.trim() || createCategoryMutation.isPending}
            >
              {createCategoryMutation.isPending ? "Creating..." : "Create"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreatingCategory(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Display current assignments as badges */}
      {value.length > 0 && (
        <div className="space-y-2">
          <Label>Current Assignments:</Label>
          <div className="flex flex-wrap gap-2">
            {value.map((assignment, index) => (
              assignment.categoryName && (
                <Badge key={index} variant="outline">
                  {assignment.categoryName}
                  {assignment.subcategory && assignment.subcategory !== "__custom__" && (
                    <span className="ml-1 text-muted-foreground">• {assignment.subcategory}</span>
                  )}
                </Badge>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiCategorySelector;
