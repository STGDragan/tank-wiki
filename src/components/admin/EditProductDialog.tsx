
import { useEffect } from "react";
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
  subcategory: z.string().optional().transform(e => e === "" ? undefined : e),
  affiliate_provider: z.string().optional(),
  affiliate_url: z.union([
    z.string().url({ message: "Please enter a valid URL." }),
    z.literal('')
  ]).optional()
    .transform(e => e === "" ? undefined : e),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

// The hardcoded category data is now fetched from the database.

interface EditProductDialogProps {
  product: Tables<'products'> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditProductDialog = ({ product, open, onOpenChange }: EditProductDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: affiliateLink, isLoading: isLoadingAffiliateLink } = useQuery({
    queryKey: ['affiliateLink', product?.id],
    queryFn: async () => {
      if (!product) return null;
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('*')
        .eq('product_id', product.id)
        .single();
      if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
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
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || "",
        image_url: product.image_url || "",
        category: product.category || "",
        subcategory: product.subcategory || "",
        affiliate_provider: affiliateLink?.provider || "",
        affiliate_url: affiliateLink?.link_url || "",
      });
    }
  }, [product, affiliateLink, form]);

  const watchedCategoryName = form.watch("category");
  const selectedCategory = categories?.find(c => c.name === watchedCategoryName);

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

  const updateProductMutation = useMutation({
    mutationFn: async (updatedValues: ProductFormValues) => {
        if (!product) throw new Error("No product to update");

        const { error: productError } = await supabase
          .from("products")
          .update({
            name: updatedValues.name,
            description: updatedValues.description || null,
            image_url: updatedValues.image_url || null,
            category: updatedValues.category || null,
            subcategory: updatedValues.subcategory || null,
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
      <DialogContent className="sm:max-w-[425px]">
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
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. https://images.unsplash.com/photo-1488590528505-98d2b5aba04b" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue('subcategory', '');
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
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subcategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategory</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''} disabled={!watchedCategoryName || isLoadingSubcategories}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingSubcategories ? "Loading..." : "Select a subcategory"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subcategories?.map((subcat) => (
                        <SelectItem key={subcat.name} value={subcat.name}>
                          {subcat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
