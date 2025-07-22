
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AquariumRecommendationsProps {
  aquariumType: string | null | undefined;
  existingEquipment: Array<{
    type: string;
    brand: string | null;
    model: string | null;
  }>;
}

export function AquariumRecommendations({ 
  aquariumType, 
  existingEquipment 
}: AquariumRecommendationsProps) {
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['aquarium-recommendations', aquariumType],
    queryFn: async () => {
      if (!aquariumType) return [];
      
      console.log('Fetching recommendations for aquarium type:', aquariumType);
      
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
        .eq('is_recommended', true)
        .is('tank_types', null)
        .limit(6);
      
      console.log('Query result:', { data, error });
      
      if (error) {
        console.error('Query error:', error);
        throw error;
      }
      
      console.log('Returning products:', data?.length || 0);
      return data || [];
    },
    enabled: !!aquariumType,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-32 rounded-lg mb-2"></div>
                <div className="bg-muted h-4 rounded mb-1"></div>
                <div className="bg-muted h-3 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return null; // Don't show the section if no real products are available
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended for Your {aquariumType} Tank</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              {product.image_url && (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
              )}
              <h3 className="font-semibold mb-2">{product.name}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {product.description}
              </p>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {product.is_on_sale && product.sale_price && (
                    <Badge variant="destructive" className="text-xs">Sale</Badge>
                  )}
                  <span className="font-bold">
                    ${product.is_on_sale && product.sale_price 
                      ? product.sale_price 
                      : product.regular_price}
                  </span>
                  {product.is_on_sale && product.sale_price && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.regular_price}
                    </span>
                  )}
                </div>
              </div>

              {product.affiliate_links && product.affiliate_links.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.open(product.affiliate_links[0].link_url, '_blank')}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy on {product.affiliate_links[0].provider}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
