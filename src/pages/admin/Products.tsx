
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Star, ThumbsUp, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import AddProductDialog from "@/components/admin/AddProductDialog";
import { AmazonProductImportDialog } from "@/components/admin/AmazonProductImportDialog";
import AffiliateSettings from "@/components/admin/AffiliateSettings";
import { useState } from "react";
import EditProductDialog from "@/components/admin/EditProductDialog";
import { EditableProductCell } from "@/components/admin/EditableProductCell";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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

  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, updates }: { productId: string; updates: Partial<Tables<'products'>> }) => {
      const { error } = await supabase.from('products').update(updates).eq('id', productId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Product Updated', description: 'Product has been updated successfully.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating product', description: error.message, variant: 'destructive' });
    }
  });

  const handleDelete = (productId: string) => {
    deleteProductMutation.mutate(productId);
  };
  
  const handleFeatureToggle = (product: Tables<'products'>) => {
    updateProductMutation.mutate({ 
      productId: product.id, 
      updates: { is_featured: !product.is_featured } 
    });
  };

  const handleRecommendedToggle = (product: Tables<'products'>) => {
    updateProductMutation.mutate({ 
      productId: product.id, 
      updates: { is_recommended: !product.is_recommended } 
    });
  };
  
  const handleEdit = (product: Tables<'products'>) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handlePriceUpdate = (productId: string, field: 'regular_price' | 'sale_price', value: number | null) => {
    updateProductMutation.mutate({ 
      productId, 
      updates: { [field]: value } 
    });
  };

  const handleRowClick = (productId: string, e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) {
      return;
    }
    navigate(`/product/${productId}`);
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
                A list of all products in your store with pricing and inventory information. Click on any row to view product details.
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
                  <TableHead>Regular Price</TableHead>
                  <TableHead>Sale Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts && filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow 
                      key={product.id} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={(e) => handleRowClick(product.id, e)}
                    >
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
                        <div>
                          <div className="flex items-center gap-2">
                            <span>{product.name}</span>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFeatureToggle(product);
                                }}
                                className="h-6 w-6 p-0"
                                disabled={updateProductMutation.isPending}
                                title={product.is_featured ? "Unfeature product" : "Feature product"}
                              >
                                <Star className={`h-4 w-4 ${product.is_featured ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRecommendedToggle(product);
                                }}
                                className="h-6 w-6 p-0"
                                disabled={updateProductMutation.isPending}
                                title={product.is_recommended ? "Unrecommend product" : "Recommend product"}
                              >
                                <ThumbsUp className={`h-4 w-4 ${product.is_recommended ? 'fill-green-400 text-green-400' : 'text-gray-400'}`} />
                              </Button>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">{product.subcategory}</div>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <EditableProductCell
                          value={product.regular_price}
                          onSave={(value) => handlePriceUpdate(product.id, 'regular_price', value)}
                          type="currency"
                        />
                      </TableCell>
                      <TableCell>
                        <EditableProductCell
                          value={product.sale_price}
                          onSave={(value) => handlePriceUpdate(product.id, 'sale_price', value)}
                          type="currency"
                        />
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
                          {product.is_on_sale && (
                            <Badge variant="secondary" className="text-xs">
                              On Sale
                            </Badge>
                          )}
                          {!product.visible && (
                            <Badge variant="outline" className="text-xs">
                              Hidden
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(product);
                            }}
                            className="h-8 w-8 p-0"
                            title="Edit product"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(product.id);
                            }}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            title="Delete product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
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
