
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ShoppingRecommendations = () => {
  const navigate = useNavigate();

  // Fetch freshwater products
  const { data: freshwaterProducts, isLoading: freshwaterLoading } = useQuery({
    queryKey: ['freshwater-recommendations'],
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
        .eq('visible', true)
        .contains('tank_types', ['freshwater'])
        .limit(12);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch saltwater products
  const { data: saltwaterProducts, isLoading: saltwaterLoading } = useQuery({
    queryKey: ['saltwater-recommendations'],
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
        .eq('visible', true)
        .contains('tank_types', ['saltwater'])
        .limit(12);
      
      if (error) throw error;
      return data || [];
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

  const ProductGrid = ({ products, isLoading }: { products: any[], isLoading: boolean }) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse" />
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (!products || products.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No products available for this tank type.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const effectivePrice = getEffectivePrice(product);
          const imageUrl = product.imageurls?.[0] || product.image_url || '/placeholder.svg';

          return (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square overflow-hidden bg-muted relative">
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-1">
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
                  {product.is_recommended && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Recommended
                    </Badge>
                  )}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                
                {product.brand && (
                  <p className="text-sm text-muted-foreground mb-2">
                    by {product.brand}
                  </p>
                )}

                {effectivePrice && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-primary">
                      ${effectivePrice.toFixed(2)}
                    </span>
                    {product.is_on_sale && product.regular_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${product.regular_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    View Details
                  </Button>
                  {product.affiliate_links?.[0]?.link_url && (
                    <Button 
                      size="sm"
                      onClick={() => window.open(product.affiliate_links[0].link_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
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

  return (
    <Tabs defaultValue="freshwater" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6 h-14 p-2 bg-muted/50 rounded-xl">
        <TabsTrigger 
          value="freshwater" 
          className="text-lg font-semibold py-3 px-6 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-background/80 transition-all duration-200"
        >
          Freshwater
        </TabsTrigger>
        <TabsTrigger 
          value="saltwater"
          className="text-lg font-semibold py-3 px-6 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-background/80 transition-all duration-200"
        >
          Saltwater
        </TabsTrigger>
      </TabsList>
      <TabsContent value="freshwater">
        <ProductGrid products={freshwaterProducts || []} isLoading={freshwaterLoading} />
      </TabsContent>
      <TabsContent value="saltwater">
        <ProductGrid products={saltwaterProducts || []} isLoading={saltwaterLoading} />
      </TabsContent>
    </Tabs>
  );
};

export default ShoppingRecommendations;
