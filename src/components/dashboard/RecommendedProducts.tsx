
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface Product {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  brand?: string;
  regular_price?: number;
  sale_price?: number;
  is_on_sale?: boolean;
  is_featured: boolean;
  is_recommended: boolean;
  category?: string;
  subcategory?: string;
  affiliate_links?: Array<{
    link_url: string;
    provider: string;
  }>;
}

export const RecommendedProducts = () => {
  const navigate = useNavigate();
  
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['recommended-products'],
    queryFn: async () => {
      console.log('Fetching recommended products...');
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
        .or('is_recommended.eq.true,is_featured.eq.true')
        .order('is_featured', { ascending: false })
        .order('is_recommended', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) {
        console.error('Error fetching recommended products:', error);
        throw error;
      }

      console.log('Recommended products fetched:', data);
      return data as Product[];
    },
  });

  const getEffectivePrice = (product: Product) => {
    if (product.is_on_sale && product.sale_price) {
      return product.sale_price;
    }
    return product.regular_price;
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleViewAllClick = () => {
    navigate('/shopping');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Recommended Products
          </CardTitle>
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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Recommended Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Unable to load recommended products at this time.</p>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Recommended Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recommended products available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Recommended Products
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleViewAllClick}>
            <ExternalLink className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
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
                <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 bg-card text-card-foreground h-full">
                  <div className="aspect-square overflow-hidden bg-muted relative cursor-pointer" onClick={() => handleProductClick(product.id)}>
                    <img
                      src={product.image_url || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.is_featured && (
                        <Badge className="bg-yellow-500 text-white hover:bg-yellow-500 shadow-md">
                          Featured
                        </Badge>
                      )}
                      {product.is_recommended && (
                        <Badge className="bg-green-500 text-white hover:bg-green-500 shadow-md">
                          Recommended
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex-1 space-y-3">
                      {/* Product title */}
                      <div className="space-y-1">
                        <h3 className="font-semibold text-base line-clamp-2 leading-tight group-hover:text-primary transition-colors cursor-pointer" onClick={() => handleProductClick(product.id)}>
                          {product.name}
                        </h3>
                        {product.brand && (
                          <p className="text-sm text-muted-foreground">
                            by {product.brand}
                          </p>
                        )}
                      </div>

                      {/* Categories */}
                      {(product.category || product.subcategory) && (
                        <div className="flex gap-1">
                          {product.category && (
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                          )}
                          {product.subcategory && (
                            <Badge variant="outline" className="text-xs">
                              {product.subcategory}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Price */}
                      {getEffectivePrice(product) && (
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-primary">
                            ${getEffectivePrice(product)?.toFixed(2)}
                          </span>
                          {product.is_on_sale && product.regular_price && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${product.regular_price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action button - fixed at bottom */}
                    <div className="pt-3 mt-auto">
                      {product.affiliate_links && product.affiliate_links.length > 0 ? (
                        <Button 
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(product.affiliate_links[0].link_url, '_blank')}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {product.affiliate_links[0].provider === 'Amazon' ? 'Buy on Amazon' : `Buy on ${product.affiliate_links[0].provider}`}
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            console.log('Add to cart clicked for product:', product.id);
                          }}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      )}
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
};
