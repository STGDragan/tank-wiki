
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type Aquarium = Pick<Tables<'aquariums'>, 'type'>;

interface RecommendationCarouselProps {
  title: string;
  products: any[];
}

const RecommendationCarousel = ({ title, products }: RecommendationCarouselProps) => {
  const navigate = useNavigate();

  const getEffectivePrice = (product: any) => {
    if (product.is_on_sale && product.sale_price && 
        (!product.sale_start_date || new Date(product.sale_start_date) <= new Date()) &&
        (!product.sale_end_date || new Date(product.sale_end_date) >= new Date())) {
      return product.sale_price;
    }
    return product.regular_price;
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recommendations available for this category.
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full px-12"
      >
        <CarouselContent>
          {products.map((product, index) => {
            const effectivePrice = getEffectivePrice(product);
            const imageUrl = product.imageurls?.[0] || product.image_url || '/placeholder.svg';

            return (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="h-[300px] flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square overflow-hidden bg-muted relative flex-shrink-0">
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
                    <CardContent className="p-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h4 className="font-semibold line-clamp-2 text-sm">{product.name}</h4>
                        {product.brand && (
                          <p className="text-xs text-muted-foreground">
                            by {product.brand}
                          </p>
                        )}
                        {effectivePrice && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-primary">
                              ${effectivePrice.toFixed(2)}
                            </span>
                            {product.is_on_sale && product.regular_price && (
                              <span className="text-xs text-muted-foreground line-through">
                                ${product.regular_price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 text-xs h-8"
                          onClick={() => navigate(`/product/${product.id}`)}
                        >
                          View Details
                        </Button>
                        {product.affiliate_links?.[0]?.link_url && (
                          <Button 
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => window.open(product.affiliate_links[0].link_url, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

interface RecommendationsProps {
  aquariums: Aquarium[];
}

export function Recommendations({ aquariums }: RecommendationsProps) {
  const hasSaltwater = aquariums.some((aq) => aq.type === 'saltwater');
  const hasFreshwater = aquariums.some((aq) => aq.type === 'freshwater');

  // Fetch recommended products from the database
  const { data: recommendedProducts, isLoading } = useQuery({
    queryKey: ['dashboard-recommended-products'],
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
        .eq('visible', true);
      
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>Loading recommendations...</CardDescription>
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

  const noTypedAquariums = !hasSaltwater && !hasFreshwater;

  // Filter products based on aquarium types if available
  let saltwaterProducts = recommendedProducts || [];
  let freshwaterProducts = recommendedProducts || [];

  // If we have specific aquarium types, we could potentially filter by category
  // For now, we'll show all recommended products for both types
  // In the future, you might want to add a field to products to specify aquarium compatibility

  if (noTypedAquariums) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>Set an aquarium type to get personalized suggestions. Here are our recommended products!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <RecommendationCarousel title="Recommended Products" products={recommendedProducts || []} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendations</CardTitle>
        <CardDescription>Based on your aquariums, here are some product recommendations for you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {hasSaltwater && <RecommendationCarousel title="Recommended for Saltwater Aquariums" products={saltwaterProducts} />}
        {hasFreshwater && <RecommendationCarousel title="Recommended for Freshwater Aquariums" products={freshwaterProducts} />}
      </CardContent>
    </Card>
  );
}
