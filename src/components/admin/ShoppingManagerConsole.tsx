
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
import { Edit, Trash2, Star, ThumbsUp, Filter, Eye, Settings, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import AddProductDialog from "@/components/admin/AddProductDialog";
import { AmazonProductImportDialog } from "@/components/admin/AmazonProductImportDialog";
import AffiliateSettings from "@/components/admin/AffiliateSettings";
import { useState } from "react";
import EditProductDialog from "@/components/admin/EditProductDialog";
import { EditableProductCell } from "@/components/admin/EditableProductCell";
import { useNavigate } from "react-router-dom";
import { ProductVisibilityControls } from "./ProductVisibilityControls";
import { WizardIntegrationPanel } from "./WizardIntegrationPanel";
import { ProductImageManager } from "./ProductImageManager";
import { ProductPreviewDialog } from "./ProductPreviewDialog";
import { SponsorshipManager } from "./SponsorshipManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const ShoppingManagerConsole = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Tables<'products'> | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewProduct, setPreviewProduct] = useState<Tables<'products'> | null>(null);
  const [previewContext, setPreviewContext] = useState<string>('shopping');
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
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) {
      return;
    }
    navigate(`/product/${productId}`);
  };

  const handlePreview = (product: Tables<'products'>, context: string) => {
    setPreviewProduct(product);
    setPreviewContext(context);
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

  const categories = Array.from(new Set(products?.map(p => p.category).filter(Boolean))) as string[];
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
        <div>
          <h1 className="text-3xl font-bold">Shopping Manager Console</h1>
          <p className="text-muted-foreground">Complete control over product visibility and display across the site</p>
        </div>
        <div className="flex gap-2">
          <AmazonProductImportDialog />
          <AddProductDialog />
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="visibility">Visibility Controls</TabsTrigger>
          <TabsTrigger value="wizard">Wizard Integration</TabsTrigger>
          <TabsTrigger value="sponsorship">Sponsorships</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <AffiliateSettings />
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Product Inventory</CardTitle>
                  <CardDescription>
                    Manage all products with quick-edit capabilities and visibility controls.
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
                      <TableHead className="w-[100px]">Image</TableHead>
                      <TableHead>Product Details</TableHead>
                      <TableHead>Pricing</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead>Stock</TableHead>
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
                          <TableCell>
                            <div className="relative">
                              <img
                                alt="Product image"
                                className="aspect-square rounded-md object-cover"
                                height="64"
                                src={product.image_url || "/placeholder.svg"}
                                width="64"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProduct(product);
                                }}
                                className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-background border"
                                title="Manage images"
                              >
                                <Image className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{product.name}</span>
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
                              <div className="text-xs text-muted-foreground">{product.category}</div>
                              <div className="text-xs text-muted-foreground">{product.subcategory}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <EditableProductCell
                                value={product.regular_price}
                                onSave={(value) => handlePriceUpdate(product.id, 'regular_price', value)}
                                type="currency"
                              />
                              <EditableProductCell
                                value={product.sale_price}
                                onSave={(value) => handlePriceUpdate(product.id, 'sale_price', value)}
                                type="currency"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {product.visible && <Badge variant="outline" className="text-xs">Shop</Badge>}
                              {product.is_featured && <Badge variant="secondary" className="text-xs">Homepage</Badge>}
                              {product.is_recommended && <Badge variant="default" className="text-xs">Wizard</Badge>}
                              {product.is_on_sale && <Badge variant="destructive" className="text-xs">Sale</Badge>}
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
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePreview(product, 'shopping');
                                }}
                                className="h-8 w-8 p-0"
                                title="Preview in shopping"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
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
                        <TableCell colSpan={6} className="h-24 text-center">
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
        </TabsContent>

        <TabsContent value="visibility">
          <ProductVisibilityControls products={products || []} onUpdate={updateProductMutation.mutate} />
        </TabsContent>

        <TabsContent value="wizard">
          <WizardIntegrationPanel products={products || []} onUpdate={updateProductMutation.mutate} />
        </TabsContent>

        <TabsContent value="sponsorship">
          <SponsorshipManager />
        </TabsContent>
      </Tabs>

      <EditProductDialog 
        product={selectedProduct}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      {selectedProduct && (
        <ProductImageManager 
          product={selectedProduct}
          open={!!selectedProduct}
          onOpenChange={() => setSelectedProduct(null)}
        />
      )}

      {previewProduct && (
        <ProductPreviewDialog
          product={previewProduct}
          context={previewContext}
          open={!!previewProduct}
          onOpenChange={() => setPreviewProduct(null)}
        />
      )}
    </div>
  );
};

export default ShoppingManagerConsole;
