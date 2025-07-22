
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import ProductCard from "@/components/shopping/ProductCard";
import { Tables } from "@/integrations/supabase/types";


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
            provider,
            link_url
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
      return data as (Tables<'products'> & { affiliate_links?: Array<{ link_url: string; provider: string; }> })[];
    },
  });

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
                <ProductCard 
                  product={product} 
                  showBuyNow={true} 
                  compact={true}
                />
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
