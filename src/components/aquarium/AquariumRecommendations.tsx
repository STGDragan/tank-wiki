
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AquariumRecommendationsProps {
  aquariumType: string | null | undefined;
  existingEquipment?: { type: string; brand: string | null; model: string | null }[];
}

export function AquariumRecommendations({ aquariumType, existingEquipment = [] }: AquariumRecommendationsProps) {
  const navigate = useNavigate();

  // Fetch actual products from database based on aquarium type
  const { data: products, isLoading } = useQuery({
    queryKey: ['aquarium-recommendations', aquariumType],
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
        .eq('visible', true);

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

      const { data, error } = await query.limit(12);
      
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
      <Card className="dark:bg-slate-800/50 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="dark:text-slate-100">Loading Recommendations...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="h-48 bg-muted rounded"></div>
              <div className="h-48 bg-muted rounded"></div>
              <div className="h-48 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Card className="dark:bg-slate-800/50 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="dark:text-slate-100">Recommendations For You</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground dark:text-slate-400 text-center py-8">
            No products found for your aquarium type. Check back later for new recommendations!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Separate livestock and equipment
  const livestockProducts = products.filter(p => p.is_livestock === true);
  const equipmentProducts = products.filter(p => p.is_livestock !== true);

  return (
    <Card className="dark:bg-slate-800/50 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="dark:text-slate-100">Recommendations For You</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {livestockProducts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 dark:text-slate-200">
              Recommended {aquariumType?.includes('Saltwater') ? 'Marine Life' : 'Freshwater Inhabitants'}
            </h3>
            <Carousel opts={{ align: "start" }} className="w-full">
              <CarouselContent>
                {livestockProducts.map((product) => {
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
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        )}

        {equipmentProducts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 dark:text-slate-200">
              Recommended Equipment
            </h3>
            <Carousel opts={{ align: "start" }} className="w-full">
              <CarouselContent>
                {equipmentProducts.map((product) => {
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
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        )}

        {livestockProducts.length === 0 && equipmentProducts.length === 0 && (
          <p className="text-muted-foreground dark:text-slate-400 text-center py-8">
            No recommendations available for this tank type.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
