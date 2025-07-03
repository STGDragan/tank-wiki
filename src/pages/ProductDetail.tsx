
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, ShoppingCart, Heart, Package, Hash, DollarSign, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductImageGallery } from "@/components/shopping/ProductImageGallery";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          affiliate_links (
            link_url,
            provider
          )
        `)
        .eq('id', id)
        .eq('visible', true)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const getEffectivePrice = () => {
    if (!product) return null;
    
    if (product.is_on_sale && product.sale_price && 
        (!product.sale_start_date || new Date(product.sale_start_date) <= new Date()) &&
        (!product.sale_end_date || new Date(product.sale_end_date) >= new Date())) {
      return product.sale_price;
    }
    
    return product.regular_price;
  };

  const getOriginalCost = () => {
    if (!product) return null;
    
    // If no sale price, use regular price as original cost
    if (!product.sale_price) {
      return product.regular_price;
    }
    
    // If there's a sale price, regular price is the original cost
    return product.regular_price;
  };

  const extractAsinFromUrl = (url: string | null) => {
    if (!url) return null;
    
    // Extract ASIN from various Amazon URL formats
    const asinPatterns = [
      /\/dp\/([A-Z0-9]{10})/i,
      /\/gp\/product\/([A-Z0-9]{10})/i,
      /\/product\/([A-Z0-9]{10})/i,
      /[?&]pd_rd_i=([A-Z0-9]{10})/i,
      /[?&]ASIN=([A-Z0-9]{10})/i
    ];

    for (const pattern of asinPatterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  const calculateSavings = () => {
    if (!product?.is_on_sale || !product.sale_price || !product.regular_price) return null;
    const savings = product.regular_price - product.sale_price;
    const percentage = Math.round((savings / product.regular_price) * 100);
    return { amount: savings, percentage };
  };

  const handlePurchase = () => {
    // Priority: 1. affiliate_url, 2. affiliate_links, 3. amazon_url, 4. show coming soon
    let purchaseUrl = null;
    
    if (product?.affiliate_url) {
      purchaseUrl = product.affiliate_url;
    } else if (product?.affiliate_links?.[0]?.link_url) {
      purchaseUrl = product.affiliate_links[0].link_url;
    } else if (product?.amazon_url) {
      purchaseUrl = product.amazon_url;
    }
    
    if (purchaseUrl) {
      window.open(purchaseUrl, '_blank');
    } else {
      toast({
        title: "Coming Soon",
        description: "Direct purchasing will be available soon!",
      });
    }
  };

  const handleAddToWishlist = () => {
    toast({
      title: "Added to Wishlist",
      description: "This feature will be available soon!",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 mobile-nav-space">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted/50 rounded w-1/4 neon-border"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted/50 rounded-lg neon-border"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted/50 rounded w-3/4 neon-border"></div>
              <div className="h-6 bg-muted/50 rounded w-1/2 neon-border"></div>
              <div className="h-20 bg-muted/50 rounded neon-border"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center mobile-nav-space">
        <Card className="cyber-card glass-panel">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-display font-bold text-muted-foreground mb-4">Product Not Found</h1>
            <Button onClick={() => navigate('/shopping')} variant="outline" className="cyber-button">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const effectivePrice = getEffectivePrice();
  const originalCost = getOriginalCost();
  const savings = calculateSavings();
  const images = Array.isArray(product.images) ? product.images as string[] : [];
  const primaryImage = product.image_url || '/placeholder.svg';
  const asin = extractAsinFromUrl(product.amazon_url) || extractAsinFromUrl(product.affiliate_url);

  const getPurchaseProvider = () => {
    if (product.affiliate_url && product.affiliate_url.includes('amazon.')) {
      return 'Amazon';
    } else if (product.affiliate_links?.[0]?.provider) {
      return product.affiliate_links[0].provider;
    } else if (product.amazon_url) {
      return 'Amazon';
    }
    return null;
  };

  const purchaseProvider = getPurchaseProvider();

  return (
    <div className="container mx-auto px-4 py-6 mobile-nav-space">
      {/* Breadcrumb */}
      <Button
        variant="ghost"
        onClick={() => navigate('/shopping')}
        className="mb-6 text-muted-foreground hover:text-foreground cyber-button"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Shopping
      </Button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <Card className="cyber-card glass-panel">
          <CardContent className="p-6">
            <ProductImageGallery
              images={images}
              productName={product.name}
              primaryImage={primaryImage}
            />
          </CardContent>
        </Card>

        {/* Product Details */}
        <div className="space-y-6">
          <Card className="cyber-card glass-panel">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                {product.category && (
                  <Badge variant="secondary" className="neon-border">{product.category}</Badge>
                )}
                {product.subcategory && (
                  <Badge variant="outline" className="neon-border">{product.subcategory}</Badge>
                )}
                {product.is_on_sale && (
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100 neon-border">
                    Sale
                  </Badge>
                )}
                {product.is_featured && (
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 neon-border">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              
              <CardTitle className="text-3xl font-display neon-text">{product.name}</CardTitle>
              
              {product.brand && (
                <CardDescription className="text-lg font-mono">by {product.brand}</CardDescription>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {effectivePrice && (
                    <span className="text-3xl font-bold text-primary neon-text">
                      ${effectivePrice.toFixed(2)}
                    </span>
                  )}
                  
                  {product.is_on_sale && originalCost && originalCost !== effectivePrice && (
                    <span className="text-xl text-muted-foreground line-through font-mono">
                      ${originalCost.toFixed(2)}
                    </span>
                  )}
                </div>
                
                {savings && (
                  <div className="text-green-400 font-medium font-mono neon-text">
                    Save ${savings.amount.toFixed(2)} ({savings.percentage}% off)
                  </div>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-sm font-mono">
                    Quantity: <span className="font-medium text-primary">{product.stock_quantity || 0}</span>
                  </span>
                </div>
                
                {product.track_inventory && (
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      (product.stock_quantity || 0) > 0 ? 'bg-green-500' : 'bg-red-500'
                    } glow`}></div>
                    <span className={`font-mono ${(product.stock_quantity || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(product.stock_quantity || 0) > 0 
                        ? `${product.stock_quantity} in stock`
                        : 'Out of stock'
                      }
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Button 
                    onClick={handlePurchase} 
                    className="flex-1 cyber-button"
                    disabled={product.track_inventory && (product.stock_quantity || 0) === 0}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {purchaseProvider ? `Buy on ${purchaseProvider}` : 'Purchase'}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                  
                  <Button variant="outline" onClick={handleAddToWishlist} className="cyber-button">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                
                {purchaseProvider && (
                  <p className="text-sm text-muted-foreground text-center font-mono">
                    Available at {purchaseProvider}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {product.description && (
            <Card className="cyber-card glass-panel">
              <CardHeader>
                <CardTitle className="font-display text-primary">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed font-mono">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Product Details */}
          <Card className="cyber-card glass-panel">
            <CardHeader>
              <CardTitle className="font-display text-primary">Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {product.brand && (
                  <div className="flex justify-between border-b border-border/30 pb-2">
                    <span className="text-muted-foreground font-mono">Brand:</span>
                    <span className="font-mono text-primary">{product.brand}</span>
                  </div>
                )}
                
                {product.model && (
                  <div className="flex justify-between border-b border-border/30 pb-2">
                    <span className="text-muted-foreground font-mono">Model:</span>
                    <span className="font-mono text-primary">{product.model}</span>
                  </div>
                )}
                
                {originalCost && (
                  <div className="flex justify-between border-b border-border/30 pb-2">
                    <span className="text-muted-foreground flex items-center gap-1 font-mono">
                      <DollarSign className="h-4 w-4" />
                      Original Cost:
                    </span>
                    <span className="font-medium font-mono text-primary">${originalCost.toFixed(2)}</span>
                  </div>
                )}
                
                {asin && (
                  <div className="flex justify-between border-b border-border/30 pb-2">
                    <span className="text-muted-foreground flex items-center gap-1 font-mono">
                      <Hash className="h-4 w-4" />
                      ASIN:
                    </span>
                    <span className="font-mono text-sm text-primary">{asin}</span>
                  </div>
                )}
                
                <div className="flex justify-between border-b border-border/30 pb-2">
                  <span className="text-muted-foreground flex items-center gap-1 font-mono">
                    <Package className="h-4 w-4" />
                    Stock Quantity:
                  </span>
                  <span className="font-medium font-mono text-primary">{product.stock_quantity || 0}</span>
                </div>
                
                {product.condition && (
                  <div className="flex justify-between border-b border-border/30 pb-2">
                    <span className="text-muted-foreground font-mono">Condition:</span>
                    <span className="capitalize font-mono text-primary">{product.condition}</span>
                  </div>
                )}
                
                {product.sku && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-mono">SKU:</span>
                    <span className="font-mono text-sm text-primary">{product.sku}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
