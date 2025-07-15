import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShoppingCart, Star } from "lucide-react";

interface Product {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  image_url?: string;
  regular_price?: number;
  sale_price?: number;
  is_on_sale?: boolean;
  description?: string;
  affiliate_links?: Array<{
    provider: string;
    link_url: string;
  }>;
}

interface EquipmentProductSelectorProps {
  equipmentType: string;
  tankType?: string;
  tankSize?: number;
  onProductSelect: (productId: string | null, product: Product | null) => void;
  selectedProductId?: string | null;
}

export const EquipmentProductSelector = ({ 
  equipmentType, 
  tankType,
  tankSize,
  onProductSelect, 
  selectedProductId 
}: EquipmentProductSelectorProps) => {

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['wizard-products', equipmentType, tankType, tankSize],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          id, name, brand, image_url, regular_price, sale_price, is_on_sale, 
          description, tank_types, category, subcategory,
          affiliate_links (
            provider,
            link_url
          )
        `)
        .eq('visible', true)
        .eq('is_recommended', true)
        .limit(5); // Show top 5 recommendations

      // Try to match by category or subcategory
      if (equipmentType) {
        query = query.or(`category.ilike.%${equipmentType}%,subcategory.ilike.%${equipmentType}%`);
      }

      if (tankType) {
        query = query.contains('tank_types', [tankType]);
      }

      const { data, error } = await query.order('name');
      
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!equipmentType,
  });

  const getEffectivePrice = (product: Product) => {
    if (product.is_on_sale && product.sale_price) {
      return product.sale_price;
    }
    return product.regular_price;
  };

  const handleProductSelect = (product: Product) => {
    onProductSelect(product.id, product);
  };
  
  const handleOwnProduct = () => {
    onProductSelect('own', { id: 'own', name: 'I have this already' } as Product);
  };

  const getAmazonLink = (product: Product) => {
    return product.affiliate_links?.find(link => 
      link.provider?.toLowerCase().includes('amazon')
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded animate-pulse"></div>
        <div className="grid grid-cols-1 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground text-sm mb-4">
            No recommended products found for {equipmentType.toLowerCase()}
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleOwnProduct}
            className="w-full"
          >
            I have this already
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm text-muted-foreground">
          Recommended {equipmentType}
        </h4>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleOwnProduct}
          className="text-xs"
        >
          I have this already
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {products.map((product) => {
          const amazonLink = getAmazonLink(product);
          const isSelected = selectedProductId === product.id;
          const isOwn = selectedProductId === 'own';
          
          return (
            <Card 
              key={product.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => handleProductSelect(product)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                        {product.name}
                      </h3>
                      {isSelected && (
                        <Badge variant="default" className="text-xs">
                          Selected
                        </Badge>
                      )}
                    </div>
                    
                    {product.brand && (
                      <p className="text-xs text-muted-foreground mt-1">
                        by {product.brand}
                      </p>
                    )}
                    
                    {product.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        {getEffectivePrice(product) && (
                          <span className="font-bold text-primary">
                            ${getEffectivePrice(product)?.toFixed(2)}
                          </span>
                        )}
                        {product.is_on_sale && product.regular_price && (
                          <span className="text-xs text-muted-foreground line-through">
                            ${product.regular_price.toFixed(2)}
                          </span>
                        )}
                        {product.is_on_sale && (
                          <Badge variant="destructive" className="text-xs">
                            Sale
                          </Badge>
                        )}
                      </div>
                      
                      {amazonLink && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(amazonLink.link_url, '_blank');
                          }}
                          className="text-xs h-7 px-2"
                        >
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Buy on Amazon
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {selectedProductId && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            <Star className="inline h-3 w-3 mr-1" />
            {selectedProductId === 'own' ? 'Using existing equipment' : 'Selected for purchase'}
          </p>
        </div>
      )}
      
      {selectedProductId === 'own' && (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              ✓ You already have this equipment
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};