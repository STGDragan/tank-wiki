import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import HierarchicalCategorySelector from "./HierarchicalCategorySelector";
import { ProductImageManager } from "./product/ProductImageManager";
import { ProductSubcategoryManager } from "./product/ProductSubcategoryManager";
import { ProductInventorySection } from "./product/ProductInventorySection";

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
  image_url: z.string().optional(),
  amazon_url: z.string().optional(),
  affiliate_url: z.string().optional(),
  track_inventory: z.boolean().default(false),
  stock_quantity: z.number().min(0, "Stock quantity must be positive").optional(),
  low_stock_threshold: z.number().min(0, "Low stock threshold must be positive").optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface EditProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditProductDialog = ({ product, open, onOpenChange }: EditProductDialogProps) => {
  const [categoryHierarchy, setCategoryHierarchy] = useState({
    category: "",
    subcategory: "",
    subSubcategory: ""
  });
  const [images, setImages] = useState<string[]>([]);
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
      image_url: "",
      amazon_url: "",
      affiliate_url: "",
      track_inventory: false,
      stock_quantity: undefined,
      low_stock_threshold: 5,
    },
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
        image_url: product.image_url || "",
        amazon_url: product.amazon_url || "",
        affiliate_url: product.affiliate_url || "",
        track_inventory: product.track_inventory || false,
        stock_quantity: product.stock_quantity || undefined,
        low_stock_threshold: product.low_stock_threshold || 5,
      });
      
      // Set up category hierarchy - reconstruct from stored data
      const subcategoriesArray = product.subcategories as string[] || [];
      
      console.log("Loading product data:", {
        category: product.category,
        subcategory: product.subcategory,
        subcategories: product.subcategories
      });
      
      const hierarchyData = {
        category: product.category || "",
        subcategory: subcategoriesArray.length > 0 ? subcategoriesArray[0] : product.subcategory || "",
        subSubcategory: subcategoriesArray.length > 1 ? subcategoriesArray[1] : ""
      };
      
      console.log("Setting category hierarchy:", hierarchyData);
      setCategoryHierarchy(hierarchyData);
      
      // Handle multiple images
      if (product.images && Array.isArray(product.images)) {
        setImages(product.images);
      } else {
        setImages([]);
      }
    } else {
      // Reset everything when no product is selected
      form.reset({
        name: "",
        description: "",
        brand: "",
        condition: "new",
        visible: true,
        is_featured: false,
        is_recommended: false,
        is_on_sale: false,
        image_url: "",
        amazon_url: "",
        affiliate_url: "",
        track_inventory: false,
        stock_quantity: undefined,
        low_stock_threshold: 5,
      });
      
      setCategoryHierarchy({
        category: "",
        subcategory: "",
        subSubcategory: ""
      });
      
      setImages([]);
    }
  }, [product, form]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setCategoryHierarchy({
        category: "",
        subcategory: "",
        subSubcategory: ""
      });
      setImages([]);
    }
  }, [open]);

  const updateProductMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      if (!product) throw new Error("No product selected");
      
      console.log("Saving product with category hierarchy:", categoryHierarchy);
      
      const productData = {
        ...values,
        category: categoryHierarchy.category,
        subcategory: categoryHierarchy.subSubcategory || categoryHierarchy.subcategory || null,
        subcategories: [categoryHierarchy.subcategory, categoryHierarchy.subSubcategory].filter(Boolean),
        images: images.length > 0 ? images : null,
        stock_quantity: values.track_inventory ? values.stock_quantity : null,
        low_stock_threshold: values.track_inventory ? values.low_stock_threshold : null,
      };

      console.log("Product data being saved:", productData);

      const { error: productError } = await supabase
        .from("products")
        .update(productData)
        .eq("id", product.id);
      
      if (productError) {
        console.error("Database error:", productError);
        throw productError;
      }
      
      console.log("Product saved successfully!");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
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
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update product details with multiple subcategories, images, and inventory tracking.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            {/* Hierarchical Category Selection */}
            <HierarchicalCategorySelector
              value={categoryHierarchy}
              onChange={setCategoryHierarchy}
              label="Product Category"
            />

            <ProductImageManager 
              images={images}
              onImagesChange={setImages}
            />

            {/* Legacy single image field for backward compatibility */}
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Image URL (Legacy)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter primary image URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amazon_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amazon URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Amazon product URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="affiliate_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Affiliate URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter affiliate URL (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <ProductInventorySection 
              control={form.control}
              watchTrackInventory={form.watch("track_inventory")}
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
