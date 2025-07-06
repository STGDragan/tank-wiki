import React, { useState, useEffect } from "react";
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
import { Edit, Trash2, Star, ThumbsUp, Filter, Eye, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AmazonProductImportDialog } from "@/components/admin/AmazonProductImportDialog";
import AffiliateSettings from "@/components/admin/AffiliateSettings";
import { useState, useEffect } from "react";
import EditProductDialog from "@/components/admin/EditProductDialog";
import { EditableProductCell } from "@/components/admin/EditableProductCell";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ProductVisibilityControls } from "./ProductVisibilityControls";
import { WizardIntegrationPanel } from "./WizardIntegrationPanel";
import { ProductImageManager } from "./ProductImageManager";
import { ProductPreviewDialog } from "./ProductPreviewDialog";
import { SponsorshipManager } from "./SponsorshipManager";
import { AddProductForm } from "./AddProductForm";
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
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Tables<'products'> | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewProduct, setPreviewProduct] = useState<Tables<'products'> | null>(null);
  const [previewContext, setPreviewContext] = useState<string>('shopping');
  const [searchParams] = useSearchParams();
  const [currentTab, setCurrentTab] = useState('products');
  const navigate = useNavigate();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['products', 'visibility', 'wizard', 'sponsorship'].includes(tab)) {
      setCurrentTab(tab);
    }
  }, [searchParams]);

  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  // Fetch categories using the same system as shopping filters
  const { data: categories = [] } = useQuery({
    queryKey: ["product-categories-new"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_categories_new")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
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
    // Ensure image manager is closed
    setIsImageManagerOpen(false);
  };

  const handleImageManager = (product: Tables<'products'>) => {
    setSelectedProduct(product);
    setIsImageManagerOpen(true);
    // Ensure edit dialog is closed
    setIsEditDialogOpen(false);
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

  const categoryOptions = React.useMemo(() => {
    const rootCategories = categories.filter(cat => cat.parent_id === null);
    const subcategoriesByParent = categories.reduce((acc, cat) => {
      if (cat.parent_id) {
        if (!acc[cat.parent_id]) acc[cat.parent_id] = [];
        acc[cat.parent_id].push(cat);
      }
      return acc;
    }, {} as Record<string, any[]>);

    const options: Array<{ value: string; label: string; level: number }> = [
      { value: 'all', label: 'All Categories', level: 0 }
    ];

    rootCategories.forEach(category => {
      options.push({ value: category.slug, label: category.name, level: 0 });
      
      if (subcategoriesByParent[category.id]) {
        subcategoriesByParent[category.id].forEach(subcat => {
          options.push({ 
            value: subcat.slug, 
            label: `${category.name} → ${subcat.name}`, 
            level: 1 
          });
          
          if (subcategoriesByParent[subcat.id]) {
            subcategoriesByParent[subcat.id].forEach(subsubcat => {
              options.push({ 
                value: subsubcat.slug, 
                label: `${category.name} → ${subcat.name} → ${subsubcat.name}`, 
                level: 2 
              });
            });
          }
        });
      }
    });

    return options;
  }, [categories]);

  const filteredProducts = products?.filter(product => 
    selectedCategory === 'all' || product.category === selectedCategory
  );

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const renderSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full bg-muted/50" />
      <Skeleton className="h-12 w-full bg-muted/50" />
      <Skeleton className="h-12 w-full bg-muted/50" />
      <Skeleton className="h-12 w-full bg-muted/50" />
    </div>
  );

  return (
    <div className="space-y-6 mobile-nav-space">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold neon-text">PRODUCT COMMAND CENTER</h1>
          <p className="text-muted-foreground font-mono">Complete control over product visibility and display across the system</p>
        </div>
        <div className="flex gap-2">
          <AmazonProductImportDialog />
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="cyber-grid grid-cols-4 glass-panel neon-border">
          <TabsTrigger value="products" className="cyber-button">Products</TabsTrigger>
          <TabsTrigger value="visibility" className="cyber-button">Visibility</TabsTrigger>
          <TabsTrigger value="wizard" className="cyber-button">Wizard</TabsTrigger>
          <TabsTrigger value="sponsorship" className="cyber-button">Sponsorship</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <AddProductForm />
          
          <Card className="cyber-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-display">Product Inventory</CardTitle>
                  <CardDescription className="font-mono">
                    Manage all products with categories matching the shopping page filters.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-64 cyber-input">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-border max-h-96 overflow-y-auto">
                      {categoryOptions.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                          className={option.level > 0 ? `pl-${4 + option.level * 2} text-sm` : ''}
                        >
                          {option.label}
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
                    <TableRow className="border-border/30">
                      <TableHead className="w-[100px] font-display text-primary">Image</TableHead>
                      <TableHead className="w-[150px] font-display text-primary">Product</TableHead>
                      <TableHead className="font-display text-primary">Pricing</TableHead>
                      <TableHead className="font-display text-primary">Visibility</TableHead>
                      <TableHead className="font-display text-primary">Stock</TableHead>
                      <TableHead className="font-display text-primary">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts && filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <TableRow 
                          key={product.id} 
                          className="cursor-pointer hover:bg-muted/20 transition-colors border-border/20"
                          onClick={(e) => handleRowClick(product.id, e)}
                        >
                          <TableCell>
                            <div className="relative">
                              <img
                                alt="Product image"
                                className="aspect-square rounded-sm object-cover neon-border"
                                height="64"
                                src={product.image_url || "/placeholder.svg"}
                                width="64"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImageManager(product);
                                }}
                                className="absolute -top-2 -right-2 h-6 w-6 p-0 cyber-button"
                                title="Manage images"
                              >
                                <Image className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[150px]">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate text-sm font-mono">{product.name}</span>
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFeatureToggle(product);
                                    }}
                                    className="h-6 w-6 p-0 cyber-button"
                                    disabled={updateProductMutation.isPending}
                                    title={product.is_featured ? "Unfeature product" : "Feature product"}
                                  >
                                    <Star className={`h-4 w-4 ${product.is_featured ? 'fill-accent text-accent' : 'text-muted-foreground'}`} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRecommendedToggle(product);
                                    }}
                                    className="h-6 w-6 p-0 cyber-button"
                                    disabled={updateProductMutation.isPending}
                                    title={product.is_recommended ? "Unrecommend product" : "Recommend product"}
                                  >
                                    <ThumbsUp className={`h-4 w-4 ${product.is_recommended ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                                  </Button>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground font-mono">{product.category}</div>
                              <div className="text-xs text-muted-foreground font-mono">{product.subcategory}</div>
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
                              {product.visible && <Badge variant="outline" className="text-xs neon-border">Shop</Badge>}
                              {product.is_featured && <Badge variant="secondary" className="text-xs">Homepage</Badge>}
                              {product.is_recommended && <Badge variant="default" className="text-xs">Wizard</Badge>}
                              {product.is_on_sale && <Badge variant="destructive" className="text-xs">Sale</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant={getStockBadgeVariant(product) as any} className="font-mono text-xs">
                                {getStockStatus(product)}
                              </Badge>
                              {product.track_inventory && (
                                <div className="text-xs text-muted-foreground font-mono">
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
                                className="h-8 w-8 p-0 cyber-button"
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
                                className="h-8 w-8 p-0 cyber-button"
                                title="Edit product"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(product.id);
                                }}
                                className="h-8 w-8 p-0"
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
                          <div className="text-muted-foreground font-mono">
                            {selectedCategory !== 'all' ? 
                              `No products found in the selected category.` : 
                              'No products found. Initialize by adding a new one!'
                            }
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <AffiliateSettings />
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
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setSelectedProduct(null);
        }}
      />

      <ProductImageManager 
        product={selectedProduct}
        open={isImageManagerOpen}
        onOpenChange={(open) => {
          setIsImageManagerOpen(open);
          if (!open) setSelectedProduct(null);
        }}
      />

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
