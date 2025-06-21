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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2, Star, ThumbsUp, DollarSign, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import AddProductDialog from "@/components/admin/AddProductDialog";
import { AmazonProductImportDialog } from "@/components/admin/AmazonProductImportDialog";
import AffiliateSettings from "@/components/admin/AffiliateSettings";
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return 'Not set';
    return `$${price.toFixed(2)}`;
  };

  const getStockStatus = (product: Tables<'products'>) => {
    if (!product.track_inventory) return 'Not tracked';
    const stock = product.stock_quantity || 0;
    const threshold = product.low_stock_threshold || 5;
    
    if (stock === 0) return 'Out of stock';
    if (stock <= threshold) return 'Low stock';
    return 'In stock';
  };

  const getStockBadgeVariant = (product: Tables<'products'>) => {
    if (!product.track_inventory) return 'secondary';
    const stock = product.stock_quantity || 0;
    const threshold = product.low_stock_threshold || 5;
    
    if (stock === 0) return 'destructive';
    if (stock <= threshold) return 'default';
    return 'outline';
  };

  // Get unique categories from products
  const categories = Array.from(new Set(products?.map(p => p.category).filter(Boolean))) as string[];

  // Filter products by selected category
  const filteredProducts = products?.filter(product => 
    selectedCategory === 'all' || product.category === selectedCategory
  );

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

      {/* Affiliate Settings */}
      <AffiliateSettings />
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product List</CardTitle>
              <CardDescription>
                A list of all products in your store with pricing and inventory information.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Quick Actions</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts && filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
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
                           <div className="flex gap-1">
                             {product.is_featured && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
                             {product.is_recommended && <ThumbsUp className="h-4 w-4 text-green-400 fill-green-400" />}
                             {product.is_on_sale && <DollarSign className="h-4 w-4 text-red-400" />}
                           </div>
                           <div>
                             <div>{product.name}</div>
                             <div className="text-xs text-muted-foreground">{product.subcategory}</div>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className={product.is_on_sale ? "line-through text-muted-foreground text-xs" : ""}>
                            {formatPrice(product.regular_price)}
                          </div>
                          {product.is_on_sale && product.sale_price && (
                            <div className="text-sm font-medium text-red-600">
                              {formatPrice(product.sale_price)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={getStockBadgeVariant(product) as any}>
                            {getStockStatus(product)}
                          </Badge>
                          {product.track_inventory && (
                            <div className="text-xs text-muted-foreground">
                              {product.stock_quantity || 0} units
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant={product.is_featured ? "default" : "outline"}
                            onClick={() => handleFeatureToggle(product)}
                            className="h-8 w-8 p-0"
                            disabled={updateFeatureStatusMutation.isPending}
                            title={product.is_featured ? "Unfeature product" : "Feature product"}
                          >
                            <Star className={`h-4 w-4 ${product.is_featured ? 'fill-current' : ''}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant={product.is_recommended ? "default" : "outline"}
                            onClick={() => handleRecommendedToggle(product)}
                            className="h-8 w-8 p-0"
                            disabled={updateRecommendedStatusMutation.isPending}
                            title={product.is_recommended ? "Unrecommend product" : "Recommend product"}
                          >
                            <ThumbsUp className={`h-4 w-4 ${product.is_recommended ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
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
                    <TableCell colSpan={7} className="h-24 text-center">
                      {selectedCategory !== 'all' ? 
                        `No products found in the "${selectedCategory}" category.` : 
                        'No products found. Get started by adding a new one!'
                      }
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
