
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ExternalLink, Star, ShoppingCart, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const calculateSavings = () => {
    if (!product?.is_on_sale || !product.sale_price || !product.regular_price) return null;
    const savings = product.regular_price - product.sale_price;
    const percentage = Math.round((savings / product.regular_price) * 100);
    return { amount: savings, percentage };
  };

  const handlePurchase = () => {
    if (product?.affiliate_links?.[0]?.link_url) {
      window.open(product.affiliate_links[0].link_url, '_blank');
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
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-6 bg-muted rounded w-1/2"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-muted-foreground mb-4">Product Not Found</h1>
        <Button onClick={() => navigate('/shopping')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shopping
        </Button>
      </div>
    );
  }

  const effectivePrice = getEffectivePrice();
  const savings = calculateSavings();
  const images = Array.isArray(product.imageurls) ? product.imageurls as string[] : [];
  const primaryImage = images[0] || product.image_url || '/placeholder.svg';

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <Button
        variant="ghost"
        onClick={() => navigate('/shopping')}
        className="mb-6 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Shopping
      </Button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(1, 5).map((image, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded border bg-muted">
                  <img
                    src={image}
                    alt={`${product.name} ${index + 2}`}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.category && (
                <Badge variant="secondary">{product.category}</Badge>
              )}
              {product.subcategory && (
                <Badge variant="outline">{product.subcategory}</Badge>
              )}
              {product.is_on_sale && (
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                  Sale
                </Badge>
              )}
              {product.is_featured && (
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                  Featured
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            {product.brand && (
              <p className="text-lg text-muted-foreground mb-4">by {product.brand}</p>
            )}
          </div>

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {effectivePrice && (
                <span className="text-3xl font-bold text-primary">
                  ${effectivePrice.toFixed(2)}
                </span>
              )}
              
              {product.is_on_sale && product.regular_price && (
                <span className="text-xl text-muted-foreground line-through">
                  ${product.regular_price.toFixed(2)}
                </span>
              )}
            </div>
            
            {savings && (
              <div className="text-green-600 font-medium">
                Save ${savings.amount.toFixed(2)} ({savings.percentage}% off)
              </div>
            )}
          </div>

          {/* Stock Status */}
          {product.track_inventory && (
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                product.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className={product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                {product.stock_quantity > 0 
                  ? `${product.stock_quantity} in stock`
                  : 'Out of stock'
                }
              </span>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button 
                onClick={handlePurchase} 
                className="flex-1"
                disabled={product.track_inventory && product.stock_quantity === 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {product.affiliate_links?.[0]?.link_url ? 'Buy Now' : 'Purchase'}
                {product.affiliate_links?.[0]?.link_url && (
                  <ExternalLink className="ml-2 h-4 w-4" />
                )}
              </Button>
              
              <Button variant="outline" onClick={handleAddToWishlist}>
                <Heart className="h-4 w-4" />
              </Button>
            </div>
            
            {product.affiliate_links?.[0]?.provider && (
              <p className="text-sm text-muted-foreground text-center">
                Available at {product.affiliate_links[0].provider}
              </p>
            )}
          </div>

          {/* Product Details */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Product Details</h3>
              <div className="space-y-3">
                {product.brand && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Brand:</span>
                    <span>{product.brand}</span>
                  </div>
                )}
                
                {product.model && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model:</span>
                    <span>{product.model}</span>
                  </div>
                )}
                
                {product.condition && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Condition:</span>
                    <span className="capitalize">{product.condition}</span>
                  </div>
                )}
                
                {product.sku && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SKU:</span>
                    <span className="font-mono text-sm">{product.sku}</span>
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
