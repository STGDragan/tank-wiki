
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
}

export const RecommendedProducts = () => {
  const navigate = useNavigate();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['recommended-products'],
    queryFn: async () => {
      console.log('Fetching recommended products...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('visible', true)
        .or('is_recommended.eq.true,is_featured.eq.true')
        .order('is_featured', { ascending: false })
        .order('is_recommended', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-lg mb-2"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card
              key={product.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleProductClick(product.id)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {product.image_url && (
                    <div className="aspect-square overflow-hidden rounded-md bg-muted">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm leading-tight line-clamp-2">
                        {product.name}
                      </h4>
                      <div className="flex gap-1">
                        {product.is_featured && (
                          <Badge variant="default" className="text-xs">
                            Featured
                          </Badge>
                        )}
                        {product.is_recommended && (
                          <Badge variant="secondary" className="text-xs">
                            Recommended
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {product.brand && (
                      <p className="text-xs text-muted-foreground">{product.brand}</p>
                    )}
                    
                    {product.category && (
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                        {product.subcategory && (
                          <Badge variant="outline" className="text-xs">
                            {product.subcategory}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {getEffectivePrice(product) && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary">
                          ${getEffectivePrice(product)?.toFixed(2)}
                        </span>
                        {product.is_on_sale && product.regular_price && (
                          <span className="text-xs text-muted-foreground line-through">
                            ${product.regular_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
