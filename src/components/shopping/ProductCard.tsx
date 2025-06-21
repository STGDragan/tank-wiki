
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, ThumbsUp, DollarSign, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProductCardProps {
  product: Tables<'products'> & {
    affiliate_links?: Array<{
      link_url: string;
      provider: string;
    }>;
    category_info?: {
      id: string;
      name: string;
      slug: string;
    };
    compatibility_tags?: Array<{
      id: string;
      name: string;
      tag_type: string;
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

  // Truncate description
  const truncateDescription = (text: string | null, maxLength: number = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Format tank types for display
  const formatTankTypes = (tankTypes: string[] | null) => {
    if (!tankTypes || tankTypes.length === 0) return null;
    return tankTypes.map(type => 
      type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    ).join(', ');
  };

  // Format enum values for display
  const formatEnumValue = (value: string | null) => {
    if (!value) return null;
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <TooltipProvider>
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

          {/* Enhanced Category & Properties */}
          <div className="space-y-2">
            {/* Category */}
            <div className="flex items-center gap-2 text-xs">
              {product.category_info && (
                <Badge variant="outline" className="text-xs">
                  {product.category_info.name}
                </Badge>
              )}
              {product.subcategory && (
                <Badge variant="outline" className="text-xs">
                  {product.subcategory}
                </Badge>
              )}
            </div>

            {/* Livestock-specific information */}
            {product.is_livestock && (
              <div className="flex flex-wrap gap-1 text-xs">
                {product.size_class && (
                  <Badge variant="secondary" className="text-xs">
                    {formatEnumValue(product.size_class)}
                  </Badge>
                )}
                {product.temperament && (
                  <Badge variant="secondary" className="text-xs">
                    {formatEnumValue(product.temperament)}
                  </Badge>
                )}
                {product.difficulty_level && (
                  <Badge variant="secondary" className="text-xs">
                    {formatEnumValue(product.difficulty_level)}
                  </Badge>
                )}
              </div>
            )}

            {/* Tank Types */}
            {product.tank_types && product.tank_types.length > 0 && (
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">
                      Suitable for: {formatTankTypes(product.tank_types)}
                    </p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-xs text-muted-foreground truncate">
                  {product.tank_types.length} tank type{product.tank_types.length > 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Compatibility Tags */}
            {product.compatibility_tags && product.compatibility_tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.compatibility_tags.slice(0, 3).map((tag) => (
                  <Tooltip key={tag.id}>
                    <TooltipTrigger>
                      <Badge 
                        variant="outline" 
                        className={`text-xs cursor-help ${
                          tag.tag_type === 'safety' ? 'border-green-300 text-green-700' :
                          tag.tag_type === 'behavior' ? 'border-blue-300 text-blue-700' :
                          tag.tag_type === 'compatibility' ? 'border-purple-300 text-purple-700' :
                          'border-gray-300 text-gray-700'
                        }`}
                      >
                        {tag.name}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">{tag.name}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {product.compatibility_tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{product.compatibility_tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Care Information for Livestock */}
            {product.is_livestock && (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {product.max_size && (
                  <span>Max size: {product.max_size}</span>
                )}
                {product.min_tank_size && (
                  <span>Min tank: {product.min_tank_size}</span>
                )}
              </div>
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
    </TooltipProvider>
  );
};

export default ProductCard;

