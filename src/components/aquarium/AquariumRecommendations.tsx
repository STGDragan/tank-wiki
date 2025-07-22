
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import React from "react";
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
  
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['aquarium-recommendations', aquariumType],
    queryFn: async () => {
      if (!aquariumType) return [];
      
      console.log('Fetching recommendations for aquarium type:', aquariumType);
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *
        `)
        .eq('visible', true)
        .eq('is_recommended', true)
        .is('tank_types', null)
        .limit(12);
      
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

  const getEffectivePrice = (product: any) => {
    if (product.is_on_sale && product.sale_price && 
        (!product.sale_start_date || new Date(product.sale_start_date) <= new Date()) &&
        (!product.sale_end_date || new Date(product.sale_end_date) >= new Date())) {
      return product.sale_price;
    }
    return product.regular_price;
  };

  const hasAffiliateLink = (product: any) => {
    return product.affiliate_url || product.amazon_url;
  };

  const getAffiliateUrl = (product: any) => {
    return product.affiliate_url || product.amazon_url;
  };

  const getAffiliateProvider = (product: any) => {
    if (product.affiliate_url || product.amazon_url) {
      return 'Amazon'; // Since these are Amazon URLs based on the data
    }
    return 'Store';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-80 animate-pulse">
                <div className="bg-muted aspect-square rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="bg-muted h-4 rounded"></div>
                  <div className="bg-muted h-3 rounded w-2/3"></div>
                  <div className="bg-muted h-6 rounded w-1/3"></div>
                </div>
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
        <Carousel 
          plugins={[plugin.current]}
          className="w-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {products.map((product) => (
              <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-72 sm:basis-80">
                <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 bg-card text-card-foreground h-full flex flex-col">
                  <div className="aspect-square overflow-hidden bg-muted relative">
                    <img
                      src={product.image_url || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Sale badge */}
                    {product.is_on_sale && getEffectivePrice(product) < product.regular_price && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-red-500 text-white hover:bg-red-500 shadow-md">
                          Sale
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-2 flex flex-col min-h-0">
                    <div className="space-y-1 flex-grow">
                    {/* Product title */}
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">
                        ${getEffectivePrice(product).toFixed(2)}
                      </span>
                      {product.is_on_sale && getEffectivePrice(product) < product.regular_price && (
                        <span className="text-xs text-muted-foreground line-through">
                          ${product.regular_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    </div>

                    {/* Action button - tight spacing */}
                    <div className="pt-1">
                      <Button 
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          if (hasAffiliateLink(product)) {
                            window.open(getAffiliateUrl(product), '_blank');
                          } else {
                            console.log('Add to cart clicked for product:', product.id);
                          }
                        }}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {hasAffiliateLink(product) ? 
                          (getAffiliateProvider(product) === 'Amazon' ? 'Buy on Amazon' : `Buy on ${getAffiliateProvider(product)}`) : 
                          'Add to Cart'
                        }
                        {hasAffiliateLink(product) && (
                          <ExternalLink className="h-4 w-4 ml-2" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </CardContent>
    </Card>
  );
}
