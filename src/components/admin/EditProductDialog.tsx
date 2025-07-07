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
import CategorySelector from "./CategorySelector";

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
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [newImage, setNewImage] = useState("");
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
      
      setSelectedCategory(product.category || "");
      
      // Handle multiple subcategories safely
      if ((product as any).subcategories && Array.isArray((product as any).subcategories)) {
        setSubcategories((product as any).subcategories);
      } else if (product.subcategory) {
        setSubcategories([product.subcategory]);
      } else {
        setSubcategories([]);
      }
      
      // Handle multiple images safely
      if ((product as any).images && Array.isArray((product as any).images)) {
        setImages((product as any).images);
      } else {
        setImages([]);
      }
    }
  }, [product, form]);

  const updateProductMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      if (!product) throw new Error("No product selected");
      
      const productData = {
        ...values,
        category: selectedCategory,
        subcategory: subcategories.length > 0 ? subcategories[0] : null, // Keep backward compatibility
        subcategories: subcategories.length > 0 ? subcategories : null,
        images: images.length > 0 ? images : null,
        stock_quantity: values.track_inventory ? values.stock_quantity : null,
        low_stock_threshold: values.track_inventory ? values.low_stock_threshold : null,
      };

      const { error: productError } = await supabase
        .from("products")
        .update(productData)
        .eq("id", product.id);
      
      if (productError) throw productError;
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

  const addImage = () => {
    if (newImage.trim() && !images.includes(newImage.trim())) {
      setImages([...images, newImage.trim()]);
      setNewImage("");
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addSubcategory = (subcategory: string) => {
    if (subcategory.trim() && !subcategories.includes(subcategory.trim())) {
      setSubcategories([...subcategories, subcategory.trim()]);
    }
  };

  const removeSubcategory = (index: number) => {
    setSubcategories(subcategories.filter((_, i) => i !== index));
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

            {/* Category and Subcategories */}
            <div className="space-y-4">
              <CategorySelector
                value={selectedCategory}
                onChange={setSelectedCategory}
                subcategory=""
                onSubcategoryChange={(subcategory) => {
                  if (subcategory) addSubcategory(subcategory);
                }}
              />
              
              {/* Multiple Subcategories */}
              {subcategories.length > 0 && (
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
              )}
            </div>

            {/* Images Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <FormLabel>Images</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter image URL"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                  />
                  <Button type="button" onClick={addImage} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {images.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Images</label>
                  <div className="grid grid-cols-2 gap-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={image} 
                          alt={`Product image ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
            </div>

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

            {/* Inventory Tracking Section */}
            <div className="space-y-4 border-t pt-4">
              <FormField
                control={form.control}
                name="track_inventory"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Track Inventory</FormLabel>
                  </FormItem>
                )}
              />

              {form.watch("track_inventory") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stock_quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="low_stock_threshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Low Stock Threshold</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="5"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

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
