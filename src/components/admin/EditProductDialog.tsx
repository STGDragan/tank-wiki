import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  image_url: z.union([
    z.string().url({ message: "Please enter a valid URL." }),
    z.literal('')
  ]).optional()
    .transform(e => e === "" ? undefined : e),
  category: z.string().optional().transform(e => e === "" ? undefined : e),
  custom_category: z.string().optional(),
  subcategory: z.string().optional().transform(e => e === "" ? undefined : e),
  custom_subcategory: z.string().optional(),
  affiliate_provider: z.string().optional(),
  affiliate_url: z.union([
    z.string().url({ message: "Please enter a valid URL." }),
    z.literal('')
  ]).optional()
    .transform(e => e === "" ? undefined : e),
  regular_price: z.string().optional().transform(e => e === "" ? undefined : parseFloat(e || "0")),
  sale_price: z.string().optional().transform(e => e === "" ? undefined : parseFloat(e || "0")),
  is_on_sale: z.boolean().default(false),
  track_inventory: z.boolean().default(true),
  stock_quantity: z.string().optional().transform(e => e === "" ? 0 : parseInt(e || "0")),
  low_stock_threshold: z.string().optional().transform(e => e === "" ? 5 : parseInt(e || "5")),
}).refine(data => !(data.category === 'Other' && !data.custom_category?.trim()), {
    message: "Please specify the category name",
    path: ["custom_category"],
}).refine(data => !(data.subcategory === 'Other' && !data.custom_subcategory?.trim()), {
    message: "Please specify the subcategory name",
    path: ["custom_subcategory"],
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface EditProductDialogProps {
  product: Tables<'products'> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditProductDialog = ({ product, open, onOpenChange }: EditProductDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  const { data: affiliateLink, isLoading: isLoadingAffiliateLink } = useQuery({
    queryKey: ['affiliateLink', product?.id],
    queryFn: async () => {
      if (!product) return null;
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('*')
        .eq('product_id', product.id)
        .single();
      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!product,
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['product_categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('product_categories').select('id, name').order('name');
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      image_url: "",
      category: "",
      custom_category: "",
      subcategory: "",
      custom_subcategory: "",
      affiliate_provider: "",
      affiliate_url: "",
      regular_price: undefined,
      sale_price: undefined,
      is_on_sale: false,
      track_inventory: true,
      stock_quantity: 0,
      low_stock_threshold: 5,
    }
  });

  useEffect(() => {
    if (product) {
      const existingImages = Array.isArray(product.imageurls) ? product.imageurls as string[] : [];
      setAdditionalImages(existingImages.slice(1)); // Skip the first image which is the main image
      
      form.reset({
        name: product.name,
        description: product.description || "",
        image_url: product.image_url || "",
        category: product.category || "",
        subcategory: product.subcategory || "",
        affiliate_provider: affiliateLink?.provider || "",
        affiliate_url: affiliateLink?.link_url || "",
        regular_price: product.regular_price || undefined,
        sale_price: product.sale_price || undefined,
        is_on_sale: product.is_on_sale || false,
        track_inventory: product.track_inventory ?? true,
        stock_quantity: product.stock_quantity || 0,
        low_stock_threshold: product.low_stock_threshold || 5,
        custom_category: "",
        custom_subcategory: "",
      });
    }
  }, [product, affiliateLink, form]);

  const watchedCategory = form.watch("category");
  const watchedSubcategory = form.watch("subcategory");
  const watchedTrackInventory = form.watch("track_inventory");
  const selectedCategory = categories?.find(c => c.name === watchedCategory);

  const { data: subcategories, isLoading: isLoadingSubcategories } = useQuery({
    queryKey: ['product_subcategories', selectedCategory?.id],
    queryFn: async () => {
      if (!selectedCategory?.id) return [];
      const { data, error } = await supabase.from('product_subcategories').select('name').eq('category_id', selectedCategory.id).order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCategory?.id,
  });

  const addImage = () => {
    if (newImageUrl.trim()) {
      setAdditionalImages(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const updateProductMutation = useMutation({
    mutationFn: async (updatedValues: ProductFormValues) => {
        if (!product) throw new Error("No product to update");

        let categoryName = updatedValues.category;
        let subcategoryName = updatedValues.subcategory;
        let categoryId = categories?.find(c => c.name === updatedValues.category)?.id;

        // Handle custom category
        if (updatedValues.category === 'Other' && updatedValues.custom_category) {
            categoryName = updatedValues.custom_category;
            const { data: newCat, error: catError } = await supabase.from('product_categories').insert({ name: categoryName }).select().single();
            if (catError) throw catError;
            categoryId = newCat.id;
        }

        // Handle custom subcategory
        if (updatedValues.subcategory === 'Other' && updatedValues.custom_subcategory) {
            if (!categoryId) throw new Error('A category must be selected or created to add a new subcategory.');
            subcategoryName = updatedValues.custom_subcategory;
            const { error: subcatError } = await supabase.from('product_subcategories').insert({ name: subcategoryName, category_id: categoryId });
            if (subcatError) throw subcatError;
        }

        // Combine main image with additional images
        const allImages = [updatedValues.image_url, ...additionalImages].filter(Boolean);

        const { error: productError } = await supabase
          .from("products")
          .update({
            name: updatedValues.name,
            description: updatedValues.description || null,
            image_url: updatedValues.image_url || null,
            imageurls: allImages,
            category: categoryName === 'Other' ? undefined : categoryName,
            subcategory: subcategoryName === 'Other' ? undefined : subcategoryName,
            regular_price: updatedValues.regular_price || null,
            sale_price: updatedValues.sale_price || null,
            is_on_sale: updatedValues.is_on_sale,
            track_inventory: updatedValues.track_inventory,
            stock_quantity: updatedValues.stock_quantity || 0,
            low_stock_threshold: updatedValues.low_stock_threshold || 5,
          })
          .eq("id", product.id);
        if (productError) throw productError;

        const hasNewUrl = updatedValues.affiliate_url;
        if (hasNewUrl) {
          if (affiliateLink) {
            const { error: updateError } = await supabase
              .from('affiliate_links')
              .update({ link_url: updatedValues.affiliate_url, provider: updatedValues.affiliate_provider || null })
              .eq('id', affiliateLink.id);
            if (updateError) throw updateError;
          } else {
            const { error: insertError } = await supabase
              .from('affiliate_links')
              .insert({ product_id: product.id, link_url: updatedValues.affiliate_url, provider: updatedValues.affiliate_provider || null });
            if (insertError) throw insertError;
          }
        } else if (affiliateLink) {
          const { error: deleteError } = await supabase
            .from('affiliate_links')
            .delete()
            .eq('id', affiliateLink.id);
          if (deleteError) throw deleteError;
        }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ['affiliateLink', product?.id] });
      queryClient.invalidateQueries({ queryKey: ["product_categories"] });
      queryClient.invalidateQueries({ queryKey: ["product_subcategories"] });
      toast({ title: "Product Updated", description: "The product has been updated successfully." });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error updating product", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    updateProductMutation.mutate(data);
  };
  
  const isLoading = updateProductMutation.isPending || isLoadingAffiliateLink;

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update the details of the product below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Aquarium Filter" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g. A high-quality filter for up to 50 gallons." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. https://images.unsplash.com/photo-1488590528505-98d2b5aba04b" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Images Section */}
            <div className="space-y-2">
              <FormLabel>Additional Images</FormLabel>
              {additionalImages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {additionalImages.map((url, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      <span className="truncate max-w-[100px]">{url}</span>
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeImage(index)} />
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Additional image URL"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                />
                <Button type="button" onClick={addImage} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="regular_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Regular Price</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" type="number" step="0.01" {...field} value={field.value?.toString() || ""} onChange={(e) => field.onChange(e.target.value)} />
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
                      <Input placeholder="0.00" type="number" step="0.01" {...field} value={field.value?.toString() || ""} onChange={(e) => field.onChange(e.target.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_on_sale"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Product is on sale</FormLabel>
                </FormItem>
              )}
            />

            {/* Inventory Section */}
            <FormField
              control={form.control}
              name="track_inventory"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Track inventory</FormLabel>
                </FormItem>
              )}
            />

            {watchedTrackInventory && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stock_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input placeholder="0" type="number" {...field} value={field.value?.toString() || ""} onChange={(e) => field.onChange(e.target.value)} />
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
                        <Input placeholder="5" type="number" {...field} value={field.value?.toString() || ""} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue('subcategory', '');
                    form.setValue('custom_subcategory', '');
                     if (value !== 'Other') {
                      form.setValue('custom_category', '');
                    }
                  }} value={field.value || ''} disabled={isLoadingCategories}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingCategories ? "Loading..." : "Select a category"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="Other">Other...</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {watchedCategory === 'Other' && (
              <FormField
                control={form.control}
                name="custom_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Aquarium Decor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="subcategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategory</FormLabel>
                   <Select onValueChange={(value) => {
                    field.onChange(value);
                     if (value !== 'Other') {
                      form.setValue('custom_subcategory', '');
                    }
                  }} value={field.value || ''} disabled={!watchedCategory || watchedCategory === 'Other' || isLoadingSubcategories}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          isLoadingSubcategories ? "Loading..." 
                          : watchedCategory === 'Other' ? 'Define new subcategory below'
                          : "Select a subcategory"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subcategories?.map((subcat) => (
                        <SelectItem key={subcat.name} value={subcat.name}>
                          {subcat.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="Other">Other...</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {(watchedSubcategory === 'Other' || watchedCategory === 'Other') && (
              <FormField
                control={form.control}
                name="custom_subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Subcategory Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Ornaments" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="affiliate_provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Affiliate Provider</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Amazon" {...field} value={field.value ?? ""} />
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
                    <Input placeholder="e.g. https://amazon.com/product/123" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
