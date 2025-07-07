
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, DollarSign, Info, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

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
  showBuyNow?: boolean;
}

const ProductCard = ({ product, showBuyNow = false }: ProductCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getEffectivePrice = () => {
    if (product.is_on_sale && product.sale_price && 
        (!product.sale_start_date || new Date(product.sale_start_date) <= new Date()) &&
        (!product.sale_end_date || new Date(product.sale_end_date) >= new Date())) {
      return product.sale_price;
    }
    return product.regular_price;
  };

  const effectivePrice = getEffectivePrice();
  
  // Get all available images
  const allImages = [];
  if (product.images && Array.isArray(product.images)) {
    allImages.push(...product.images);
  }
  if (product.imageurls && Array.isArray(product.imageurls)) {
    allImages.push(...product.imageurls);
  }
  if (product.image_url) {
    allImages.push(product.image_url);
  }
  
  // Remove duplicates and use placeholder if no images
  const uniqueImages = [...new Set(allImages)];
  const images = uniqueImages.length > 0 ? uniqueImages : ['/placeholder.svg'];
  
  const affiliateUrl = product.affiliate_links?.[0]?.link_url;

  // Get subcategories for display
  const subcategories = [];
  if (product.subcategories && Array.isArray(product.subcategories)) {
    subcategories.push(...product.subcategories);
  } else if (product.subcategory) {
    subcategories.push(product.subcategory);
  }

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

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (affiliateUrl) {
      window.open(affiliateUrl, '_blank');
    } else {
      toast({
        title: "Coming Soon",
        description: "Direct purchasing will be available soon!",
      });
    }
  };

  const handleAmazonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (affiliateUrl) {
      window.open(affiliateUrl, '_blank');
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const isOutOfStock = product.track_inventory && (product.stock_quantity === 0);
  const isLowStock = product.track_inventory && 
    product.stock_quantity !== null && 
    product.stock_quantity <= (product.low_stock_threshold || 5) && 
    product.stock_quantity > 0;

  return (
    <TooltipProvider>
      <Card 
        className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 bg-card text-card-foreground cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="aspect-square overflow-hidden bg-muted relative">
          <img
            src={images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              {/* Image indicators */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Product badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_on_sale && (
              <Badge className="bg-red-500 text-white hover:bg-red-500 shadow-md">
                <DollarSign className="h-3 w-3 mr-1" />
                Sale
              </Badge>
            )}
          </div>

          {/* Stock status */}
          <div className="absolute top-2 right-2">
            {isOutOfStock && (
              <Badge variant="destructive" className="shadow-md">
                Out of Stock
              </Badge>
            )}
            {isLowStock && (
              <Badge variant="default" className="shadow-md">
                Low Stock
              </Badge>
            )}
          </div>
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
            {/* Category and Subcategories */}
            <div className="flex items-center gap-2 text-xs">
              {product.category_info && (
                <Badge variant="outline" className="text-xs">
                  {product.category_info.name}
                </Badge>
              )}
              {subcategories.map((subcategory, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {subcategory}
                </Badge>
              ))}
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

            {/* Stock Information */}
            {product.track_inventory && (
              <div className="text-xs text-muted-foreground">
                {product.stock_quantity !== null && (
                  <span>{product.stock_quantity} in stock</span>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            {showBuyNow && (
              <Button 
                size="sm"
                className="flex-1"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                {isOutOfStock ? "Out of Stock" : "Buy Now"}
              </Button>
            )}
            {affiliateUrl && !showBuyNow && (
              <Button 
                size="sm"
                className="px-3 ml-auto"
                onClick={handleAmazonClick}
                disabled={isOutOfStock}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                {isOutOfStock ? "Out of Stock" : "Buy Now"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default ProductCard;
