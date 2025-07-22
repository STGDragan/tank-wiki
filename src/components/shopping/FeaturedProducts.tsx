
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  const { data: products, isLoading } = useQuery({
    queryKey: ['featured-products'],
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
        .eq('is_featured', true)
        .eq('visible', true)
        .limit(12);
      
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

  const handleBuyNow = (product: any) => {
    const affiliateUrl = product.affiliate_links?.[0]?.link_url;
    if (affiliateUrl) {
      window.open(affiliateUrl, '_blank');
    } else {
      toast({
        title: "Coming Soon",
        description: "Direct purchasing will be available soon!",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Featured Products</CardTitle>
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

  if (!products?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Featured Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No featured products available.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Featured Products</CardTitle>
      </CardHeader>
      <CardContent>
        <Carousel 
          plugins={[plugin.current]}
          className="w-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {products.map((product) => {
              const effectivePrice = getEffectivePrice(product);
              const imageUrl = product.imageurls?.[0] || product.image_url || '/placeholder.svg';

              return (
                <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-72 sm:basis-80">
                  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 bg-card text-card-foreground h-full">
                    <div className="aspect-square overflow-hidden bg-muted relative">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 flex gap-1">
                        {product.is_on_sale && (
                          <Badge className="bg-red-500 text-white hover:bg-red-500 shadow-md">
                            Sale
                          </Badge>
                        )}
                        <Badge className="bg-yellow-500 text-white hover:bg-yellow-500 shadow-md">
                          Featured
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-base line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        
                        {product.brand && (
                          <p className="text-sm text-muted-foreground">
                            by {product.brand}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {effectivePrice && (
                          <span className="text-xl font-bold text-primary">
                            ${effectivePrice.toFixed(2)}
                          </span>
                        )}
                        {product.is_on_sale && product.regular_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${product.regular_price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate(`/product/${product.id}`)}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleBuyNow(product)}
                          disabled={product.track_inventory && (product.stock_quantity || 0) === 0}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Buy Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </CardContent>
    </Card>
  );
};

export default FeaturedProducts;
