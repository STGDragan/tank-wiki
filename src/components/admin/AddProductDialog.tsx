
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
      subcategory: "",
      affiliate_provider: "",
      affiliate_url: "",
    },
  });

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

  const addProductMutation = useMutation({
    mutationFn: async (newProduct: ProductFormValues) => {
      const { data: productData, error: productError } = await supabase
        .from("products")
        .insert({
          name: newProduct.name,
          description: newProduct.description || null,
          image_url: newProduct.image_url || null,
          category: newProduct.category || null,
          subcategory: newProduct.subcategory || null,
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
          // In a real app, you might want to roll back the product creation here.
          // For now, we'll let the user know something went wrong.
          throw affiliateError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
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
