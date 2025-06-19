
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecommendedProducts = () => {
  const navigate = useNavigate();

  const { data: products, isLoading } = useQuery({
    queryKey: ['recommended-products'],
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
        .eq('is_recommended', true)
        .eq('visible', true)
        .limit(8);
      
      if (error) throw error;
      return data;
    },
  });

  const getEffectivePrice = (product: any) => {
    if (product.is_on_sale && product.sale_price && 
        (!product.sale_start_date || new Date(product.sale_start_date) <= new Date()) &&
        (!product.sale_end_date || new Date(product.sale_end_date) >= new Date())) {
      return product.sale_price;
    }
    return product.regular_price;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-square bg-muted animate-pulse" />
            <CardContent className="p-3 space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recommended products available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map((product) => {
        const effectivePrice = getEffectivePrice(product);
        const imageUrl = product.imageurls?.[0] || product.image_url || '/placeholder.svg';

        return (
          <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-square overflow-hidden bg-muted relative">
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.is_on_sale && (
                <Badge className="absolute top-2 left-2 bg-red-100 text-red-800 hover:bg-red-100">
                  Sale
                </Badge>
              )}
            </div>
            <CardContent className="p-3">
              <h3 className="font-medium mb-1 text-sm line-clamp-2">{product.name}</h3>
              
              <div className="flex items-center gap-1 mb-2">
                {effectivePrice && (
                  <span className="text-sm font-bold text-primary">
                    ${effectivePrice.toFixed(2)}
                  </span>
                )}
                {product.is_on_sale && product.regular_price && (
                  <span className="text-xs text-muted-foreground line-through">
                    ${product.regular_price.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  View Details
                </Button>
                {product.affiliate_links?.[0]?.link_url && (
                  <Button 
                    size="sm"
                    onClick={() => window.open(product.affiliate_links[0].link_url, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RecommendedProducts;
