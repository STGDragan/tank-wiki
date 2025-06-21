import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Star, ThumbsUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import AddProductDialog from "@/components/admin/AddProductDialog";
import { AmazonProductImportDialog } from "@/components/admin/AmazonProductImportDialog";
import { useState } from "react";
import EditProductDialog from "@/components/admin/EditProductDialog";

const fetchProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    throw new Error(error.message);
  }
  return data;
};

const AdminProducts = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Tables<'products'> | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Product Deleted', description: 'The product has been successfully deleted.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting product', description: error.message, variant: 'destructive' });
    }
  });

  const updateFeatureStatusMutation = useMutation({
    mutationFn: async ({ productId, is_featured }: { productId: string; is_featured: boolean }) => {
      const { error } = await supabase.from('products').update({ is_featured }).eq('id', productId).select();
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, { is_featured }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      toast({ title: 'Product Updated', description: `Product has been ${is_featured ? 'featured' : 'unfeatured'}.` });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating product', description: error.message, variant: 'destructive' });
    }
  });

  const updateRecommendedStatusMutation = useMutation({
    mutationFn: async ({ productId, is_recommended }: { productId: string; is_recommended: boolean }) => {
      const { error } = await supabase.from('products').update({ is_recommended }).eq('id', productId).select();
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, { is_recommended }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['recommended-products'] });
      toast({ title: 'Product Updated', description: `Product has been ${is_recommended ? 'marked as recommended' : 'unmarked as recommended'}.` });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating product', description: error.message, variant: 'destructive' });
    }
  });

  const handleDelete = (productId: string) => {
    // Optional: Add a confirmation dialog here
    deleteProductMutation.mutate(productId);
  };
  
  const handleFeatureToggle = (product: Tables<'products'>) => {
    updateFeatureStatusMutation.mutate({ productId: product.id, is_featured: !product.is_featured });
  };

  const handleRecommendedToggle = (product: Tables<'products'>) => {
    updateRecommendedStatusMutation.mutate({ productId: product.id, is_recommended: !product.is_recommended });
  };
  
  const handleEdit = (product: Tables<'products'>) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const renderSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-2">
          <AmazonProductImportDialog />
          <AddProductDialog />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>
            A list of all products in your store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            renderSkeleton()
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Image</span>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subcategory</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products && products.length > 0 ? (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="hidden sm:table-cell">
                        <img
                          alt="Product image"
                          className="aspect-square rounded-md object-cover"
                          height="64"
                          src={product.image_url || "/placeholder.svg"}
                          width="64"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {product.is_featured && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
                          {product.is_recommended && <ThumbsUp className="h-4 w-4 text-green-400 fill-green-400" />}
                          {product.name}
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.subcategory}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-sm truncate">
                        {product.description}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleFeatureToggle(product)}>
                              <Star className="mr-2 h-4 w-4" />
                              <span>{product.is_featured ? 'Unfeature' : 'Feature'}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRecommendedToggle(product)}>
                              <ThumbsUp className="mr-2 h-4 w-4" />
                              <span>{product.is_recommended ? 'Unrecommend' : 'Recommend'}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(product)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No products found. Get started by adding a new one!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <EditProductDialog 
        product={selectedProduct}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
};

export default AdminProducts;
