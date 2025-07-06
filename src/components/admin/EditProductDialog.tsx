
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tables } from "@/integrations/supabase/types";
import MultiCategorySelector from "./MultiCategorySelector";

type Product = Tables<'products'>;

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  brand: z.string().optional(),
  regular_price: z.number().min(0, "Price must be positive").optional(),
  sale_price: z.number().min(0, "Sale price must be positive").optional(),
  is_on_sale: z.boolean().default(false),
  condition: z.string().optional(),
  visible: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_recommended: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface CategoryAssignment {
  categoryId: string;
  categoryName: string;
  subcategory: string;
}

interface EditProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditProductDialog = ({ product, open, onOpenChange }: EditProductDialogProps) => {
  const [categoryAssignments, setCategoryAssignments] = useState<CategoryAssignment[]>([
    { categoryId: "", categoryName: "", subcategory: "" }
  ]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      brand: "",
      condition: "new",
      visible: true,
      is_featured: false,
      is_recommended: false,
      is_on_sale: false,
    },
  });

  // Fetch existing category assignments
  const { data: existingAssignments } = useQuery({
    queryKey: ["product-category-assignments", product?.id],
    queryFn: async () => {
      if (!product?.id) return [];
      
      const { data, error } = await supabase
        .from("product_category_assignments")
        .select(`
          *,
          product_categories_new!inner(name)
        `)
        .eq("product_id", product.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!product?.id && open,
  });

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name || "",
        description: product.description || "",
        brand: product.brand || "",
        regular_price: product.regular_price || undefined,
        sale_price: product.sale_price || undefined,
        is_on_sale: product.is_on_sale || false,
        condition: product.condition || "new",
        visible: product.visible || true,
        is_featured: product.is_featured || false,
        is_recommended: product.is_recommended || false,
      });
    }
  }, [product, form]);

  // Set category assignments when data is loaded
  useEffect(() => {
    if (existingAssignments && existingAssignments.length > 0) {
      const assignments = existingAssignments.map(assignment => ({
        categoryId: assignment.category_id || "",
        categoryName: assignment.product_categories_new?.name || "",
        subcategory: assignment.subcategory_name || "",
      }));
      setCategoryAssignments(assignments);
    } else if (product) {
      // Fallback to legacy category/subcategory fields
      setCategoryAssignments([{
        categoryId: "",
        categoryName: product.category || "",
        subcategory: product.subcategory || "",
      }]);
    }
  }, [existingAssignments, product]);

  const updateProductMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      if (!product) throw new Error("No product selected");
      
      // Update the product
      const productData = {
        ...values,
        // Set primary category and subcategory for backward compatibility
        category: categoryAssignments.length > 0 ? categoryAssignments[0].categoryName : null,
        subcategory: categoryAssignments.length > 0 ? categoryAssignments[0].subcategory : null,
      };

      const { error: productError } = await supabase
        .from("products")
        .update(productData)
        .eq("id", product.id);
      
      if (productError) throw productError;

      // Delete existing category assignments
      const { error: deleteError } = await supabase
        .from("product_category_assignments")
        .delete()
        .eq("product_id", product.id);

      if (deleteError) throw deleteError;

      // Create new category assignments
      if (categoryAssignments.length > 0 && categoryAssignments[0].categoryId) {
        const assignments = categoryAssignments
          .filter(assignment => assignment.categoryId)
          .map(assignment => ({
            product_id: product.id,
            category_id: assignment.categoryId,
            subcategory_name: assignment.subcategory || null,
          }));

        if (assignments.length > 0) {
          const { error: assignmentError } = await supabase
            .from("product_category_assignments")
            .insert(assignments);

          if (assignmentError) throw assignmentError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-category-assignments"] });
      toast({ title: "Product updated successfully!" });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ProductFormValues) => {
    updateProductMutation.mutate(values);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update product details with multiple categories and subcategories.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter brand name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter product description" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <MultiCategorySelector
              productId={product.id}
              value={categoryAssignments}
              onChange={setCategoryAssignments}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="regular_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Regular Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sale_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., new, used, refurbished" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-wrap gap-6">
              <FormField
                control={form.control}
                name="visible"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Visible in Shop</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Featured</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_recommended"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Recommended</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_on_sale"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>On Sale</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateProductMutation.isPending}
                className="cyber-button"
              >
                {updateProductMutation.isPending ? "Updating..." : "Update Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
