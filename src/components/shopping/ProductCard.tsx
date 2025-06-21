
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, ThumbsUp, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";

interface ProductCardProps {
  product: Tables<'products'> & {
    affiliate_links?: Array<{
      link_url: string;
      provider: string;
    }>;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();

  const getEffectivePrice = () => {
    if (product.is_on_sale && product.sale_price && 
        (!product.sale_start_date || new Date(product.sale_start_date) <= new Date()) &&
        (!product.sale_end_date || new Date(product.sale_end_date) >= new Date())) {
      return product.sale_price;
    }
    return product.regular_price;
  };

  const effectivePrice = getEffectivePrice();
  const imageUrl = product.imageurls?.[0] || product.image_url || '/placeholder.svg';
  const affiliateUrl = product.affiliate_links?.[0]?.link_url;

  // Truncate description to 2-3 lines
  const truncateDescription = (text: string | null, maxLength: number = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 bg-white/90 backdrop-blur-sm">
      <div className="aspect-square overflow-hidden bg-muted relative">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Product badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_on_sale && (
            <Badge className="bg-red-500 text-white hover:bg-red-500 shadow-md">
              <DollarSign className="h-3 w-3 mr-1" />
              Sale
            </Badge>
          )}
          {product.is_featured && (
            <Badge className="bg-yellow-500 text-white hover:bg-yellow-500 shadow-md">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
          {product.is_recommended && (
            <Badge className="bg-green-500 text-white hover:bg-green-500 shadow-md">
              <ThumbsUp className="h-3 w-3 mr-1" />
              Recommended
            </Badge>
          )}
        </div>

        {/* Stock status */}
        {product.track_inventory && product.stock_quantity !== null && product.stock_quantity <= (product.low_stock_threshold || 5) && (
          <div className="absolute top-2 right-2">
            <Badge variant={product.stock_quantity === 0 ? "destructive" : "default"} className="shadow-md">
              {product.stock_quantity === 0 ? "Out of Stock" : "Low Stock"}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Product title */}
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

        {/* Price */}
        <div className="flex items-center gap-2">
          {effectivePrice && (
            <span className="text-xl font-bold text-primary">
              ${effectivePrice.toFixed(2)}
            </span>
          )}
          {product.is_on_sale && product.regular_price && product.regular_price !== effectivePrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.regular_price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {truncateDescription(product.description, 120)}
          </p>
        )}

        {/* Category & Subcategory */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
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

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 hover:bg-primary hover:text-white transition-colors"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            View Details
          </Button>
          {affiliateUrl && (
            <Button 
              size="sm"
              className="px-3"
              onClick={() => window.open(affiliateUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
