
import { Tables } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Eye } from "lucide-react";

interface ProductPreviewDialogProps {
  product: Tables<'products'> | null;
  context: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductPreviewDialog = ({ product, context, open, onOpenChange }: ProductPreviewDialogProps) => {
  if (!product) return null;

  const formatPrice = (price: number | null) => {
    if (!price) return 'Price not set';
    return `$${price.toFixed(2)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] cyber-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Eye className="h-5 w-5 text-primary" />
            Product Preview - {context}
          </DialogTitle>
          <DialogDescription className="font-mono">
            How this product appears to users in the {context} section
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="cyber-card p-4">
            <div className="flex gap-4">
              <img
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                className="w-32 h-32 rounded-md object-cover neon-border"
              />
              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="text-lg font-display font-bold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground font-mono">{product.brand}</p>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {product.is_featured && <Badge variant="secondary" className="font-mono">Featured</Badge>}
                  {product.is_recommended && <Badge variant="default" className="font-mono">Recommended</Badge>}
                  {product.is_on_sale && <Badge variant="destructive" className="font-mono">On Sale</Badge>}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {product.sale_price ? (
                      <>
                        <span className="text-lg font-bold text-primary font-mono">{formatPrice(product.sale_price)}</span>
                        <span className="text-sm text-muted-foreground line-through font-mono">{formatPrice(product.regular_price)}</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold font-mono">{formatPrice(product.regular_price)}</span>
                    )}
                  </div>
                </div>
                
                {product.description && (
                  <p className="text-sm text-muted-foreground font-mono line-clamp-3">
                    {product.description}
                  </p>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="cyber-button">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button size="sm" variant="outline" className="cyber-button">
                    <Star className="h-4 w-4 mr-2" />
                    Wishlist
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground font-mono">
            <p><strong>Category:</strong> {product.category || 'Not set'}</p>
            <p><strong>Subcategory:</strong> {product.subcategory || 'Not set'}</p>
            <p><strong>Stock:</strong> {product.track_inventory ? `${product.stock_quantity || 0} units` : 'Not tracked'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
