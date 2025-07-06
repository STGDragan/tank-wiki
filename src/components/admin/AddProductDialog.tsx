
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import CategorySelector from "./CategorySelector";

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
});

type ProductFormValues = z.infer<typeof productSchema>;

const AddProductDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
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
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const productData = {
        name: values.name,
        description: values.description || null,
        brand: values.brand || null,
        regular_price: values.regular_price || null,
        sale_price: values.sale_price || null,
        is_on_sale: values.is_on_sale || false,
        condition: values.condition || null,
        visible: values.visible || true,
        is_featured: values.is_featured || false,
        is_recommended: values.is_recommended || false,
        image_url: values.image_url || null,
        amazon_url: values.amazon_url || null,
        affiliate_url: values.affiliate_url || null,
        category: selectedCategory,
        subcategory: subcategory || null,
      };

      const { data: product, error: productError } = await supabase
        .from("products")
        .insert([productData])
        .select()
        .single();

      if (productError) throw productError;
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product created successfully!" });
      form.reset();
      setSelectedCategory("");
      setSubcategory("");
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ProductFormValues) => {
    createProductMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cyber-button">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Create a new product with category and subcategory.
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

            <CategorySelector
              value={selectedCategory}
              onChange={setSelectedCategory}
              subcategory={subcategory}
              onSubcategoryChange={setSubcategory}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter image URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createProductMutation.isPending}
                className="cyber-button"
              >
                {createProductMutation.isPending ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
