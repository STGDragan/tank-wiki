
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EquipmentRecommendationsProps {
  aquariumType: string | null | undefined;
  existingEquipment?: { type: string; brand: string | null; model: string | null }[];
}

export function EquipmentRecommendations({ aquariumType, existingEquipment = [] }: EquipmentRecommendationsProps) {
  const navigate = useNavigate();

  // Fetch equipment products from database
  const { data: products, isLoading } = useQuery({
    queryKey: ['equipment-recommendations', aquariumType],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          affiliate_links (
            link_url,
            provider
          )
        `)
        .eq('visible', true)
        .eq('is_livestock', false); // Only equipment, not livestock

      // Filter by tank compatibility if aquarium type is specified
      if (aquariumType) {
        const isFreshwaterType = aquariumType === "Freshwater" || 
                                aquariumType === "Planted Freshwater" || 
                                aquariumType === "Freshwater Invertebrates";
        
        const isSaltwaterType = aquariumType === "Saltwater Fish-Only (FO)" ||
                               aquariumType === "Fish-Only with Live Rock (FOWLR)" ||
                               aquariumType === "Soft Coral Reef" ||
                               aquariumType === "Mixed Reef (LPS + Soft)" ||
                               aquariumType === "SPS Reef (Hard Coral)";

        if (isFreshwaterType) {
          query = query.contains('tank_types', ['freshwater']);
        } else if (isSaltwaterType) {
          query = query.contains('tank_types', ['saltwater']);
        }
      }

      const { data, error } = await query.limit(8);
      
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

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Loading Equipment Recommendations...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="h-48 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  const isSaltwaterType = aquariumType === "Saltwater Fish-Only (FO)" ||
                         aquariumType === "Fish-Only with Live Rock (FOWLR)" ||
                         aquariumType === "Soft Coral Reef" ||
                         aquariumType === "Mixed Reef (LPS + Soft)" ||
                         aquariumType === "SPS Reef (Hard Coral)";

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>
          {isSaltwaterType ? 'Recommended Saltwater Equipment' : 'Recommended Freshwater Equipment'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Carousel opts={{ align: "start" }} className="w-full">
          <CarouselContent>
            {products.map((product) => {
              const effectivePrice = getEffectivePrice(product);
              const imageUrl = product.imageurls?.[0] || product.image_url || '/placeholder.svg';

              return (
                <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
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
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 line-clamp-2">{product.name}</h4>
                      
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
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="ml-12" />
          <CarouselNext className="mr-12" />
        </Carousel>
      </CardContent>
    </Card>
  );
}
