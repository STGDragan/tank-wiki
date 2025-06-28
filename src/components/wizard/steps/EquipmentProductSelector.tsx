
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  brand?: string;
  image_url?: string;
  regular_price?: number;
  sale_price?: number;
  is_on_sale?: boolean;
}

interface EquipmentProductSelectorProps {
  equipmentType: string;
  tankType?: string;
  onProductSelect: (productId: string | null, product: Product | null) => void;
  selectedProductId?: string | null;
}

export const EquipmentProductSelector = ({ 
  equipmentType, 
  tankType, 
  onProductSelect, 
  selectedProductId 
}: EquipmentProductSelectorProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['wizard-products', equipmentType, tankType],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('id, name, brand, image_url, regular_price, sale_price, is_on_sale, tank_types')
        .eq('visible', true)
        .eq('is_recommended', true)
        .ilike('category', `%${equipmentType}%`);

      if (tankType) {
        query = query.contains('tank_types', [tankType]);
      }

      const { data, error } = await query.order('name');
      
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!equipmentType,
  });

  const handleProductChange = (productId: string) => {
    if (productId === "none") {
      setSelectedProduct(null);
      onProductSelect(null, null);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      onProductSelect(productId, product);
    }
  };

  const getEffectivePrice = (product: Product) => {
    if (product.is_on_sale && product.sale_price) {
      return product.sale_price;
    }
    return product.regular_price;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse"></div>
        <div className="h-10 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Select value={selectedProductId || "none"} onValueChange={handleProductChange}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${equipmentType}...`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Skip for now</SelectItem>
          {products.map((product) => (
            <SelectItem key={product.id} value={product.id}>
              <div className="flex items-center gap-2">
                <span>{product.name}</span>
                {product.brand && (
                  <Badge variant="outline" className="text-xs">
                    {product.brand}
                  </Badge>
                )}
                {getEffectivePrice(product) && (
                  <span className="text-sm text-muted-foreground">
                    ${getEffectivePrice(product)?.toFixed(2)}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedProduct && (
        <Card>
          <CardContent className="p-3">
            <div className="flex gap-3">
              {selectedProduct.image_url && (
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-16 h-16 rounded object-cover"
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium text-sm">{selectedProduct.name}</h4>
                {selectedProduct.brand && (
                  <p className="text-xs text-muted-foreground">{selectedProduct.brand}</p>
                )}
                {getEffectivePrice(selectedProduct) && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-medium text-primary">
                      ${getEffectivePrice(selectedProduct)?.toFixed(2)}
                    </span>
                    {selectedProduct.is_on_sale && selectedProduct.regular_price && (
                      <span className="text-xs text-muted-foreground line-through">
                        ${selectedProduct.regular_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
