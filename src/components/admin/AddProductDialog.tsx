import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  DialogTrigger,
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
import { PlusCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
}).refine(data => !(data.category === 'Other' && !data.custom_category?.trim()), {
    message: "Please specify the category name",
    path: ["custom_category"],
}).refine(data => !(data.subcategory === 'Other' && !data.custom_subcategory?.trim()), {
    message: "Please specify the subcategory name",
    path: ["custom_subcategory"],
});

type ProductFormValues = z.infer<typeof productFormSchema>;

// The hardcoded category data is now fetched from the database.

const AddProductDialog = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    },
  });

  const watchedCategory = form.watch("category");
  const watchedSubcategory = form.watch("subcategory");
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

  const addProductMutation = useMutation({
    mutationFn: async (newProduct: ProductFormValues) => {
      let categoryName = newProduct.category;
      let subcategoryName = newProduct.subcategory;
      let categoryId = categories?.find(c => c.name === newProduct.category)?.id;

      // Handle custom category
      if (newProduct.category === 'Other' && newProduct.custom_category) {
        categoryName = newProduct.custom_category;
        const { data: newCat, error: catError } = await supabase.from('product_categories').insert({ name: categoryName }).select().single();
        if (catError) throw catError;
        categoryId = newCat.id;
      }

      // Handle custom subcategory
      if (newProduct.subcategory === 'Other' && newProduct.custom_subcategory) {
        if (!categoryId) throw new Error('A category must be selected or created to add a new subcategory.');
        subcategoryName = newProduct.custom_subcategory;
        const { error: subcatError } = await supabase.from('product_subcategories').insert({ name: subcategoryName, category_id: categoryId });
        if (subcatError) throw subcatError;
      }

      const { data: productData, error: productError } = await supabase
        .from("products")
        .insert({
          name: newProduct.name,
          description: newProduct.description || null,
          image_url: newProduct.image_url || null,
          category: categoryName === 'Other' ? undefined : categoryName,
          subcategory: subcategoryName === 'Other' ? undefined : subcategoryName,
        })
        .select()
        .single();

      if (productError) throw productError;
      if (!productData) throw new Error("Failed to create product.");

      if (newProduct.affiliate_url) {
        const { error: affiliateError } = await supabase
          .from("affiliate_links")
          .insert({
            product_id: productData.id,
            link_url: newProduct.affiliate_url,
            provider: newProduct.affiliate_provider || null,
          });

        if (affiliateError) {
          throw affiliateError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product_categories"] });
      queryClient.invalidateQueries({ queryKey: ["product_subcategories"] });
      toast({ title: "Product Added", description: "The new product has been added successfully." });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({ title: "Error adding product", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    addProductMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new product.
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
              <Button type="submit" disabled={addProductMutation.isPending}>
                {addProductMutation.isPending ? "Adding..." : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
