
import { Tables } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, ShoppingCart, Wand2, Home } from "lucide-react";
import { useState } from "react";

interface ProductPreviewDialogProps {
  product: Tables<'products'>;
  context: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductPreviewDialog = ({ product, context, open, onOpenChange }: ProductPreviewDialogProps) => {
  const [previewContext, setPreviewContext] = useState(context);

  const getContextIcon = (ctx: string) => {
    switch (ctx) {
      case 'shopping': return <ShoppingCart className="h-4 w-4" />;
      case 'wizard': return <Wand2 className="h-4 w-4" />;
      case 'homepage': return <Home className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getEffectivePrice = () => {
    if (product.is_on_sale && product.sale_price) {
      return product.sale_price;
    }
    return product.regular_price;
  };

  const renderShoppingPreview = () => (
    <Card className="w-full max-w-sm">
      <div className="aspect-square relative overflow-hidden rounded-t-lg">
        <img
          src={product.image_url || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {product.is_on_sale && (
          <Badge className="absolute top-2 right-2 bg-red-500">Sale</Badge>
        )}
        {product.is_featured && (
          <Badge className="absolute top-2 left-2 bg-yellow-500">Featured</Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
        <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {product.is_on_sale && product.sale_price && (
              <>
                <span className="text-lg font-bold">${product.sale_price}</span>
                <span className="text-sm line-through text-muted-foreground">
                  ${product.regular_price}
                </span>
              </>
            )}
            {(!product.is_on_sale || !product.sale_price) && product.regular_price && (
              <span className="text-lg font-bold">${product.regular_price}</span>
            )}
          </div>
          <Button size="sm">Add to Cart</Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderWizardPreview = () => (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recommended Equipment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h4 className="font-medium">{product.name}</h4>
            <p className="text-sm text-muted-foreground">{product.category}</p>
            <div className="flex items-center gap-2 mt-1">
              {getEffectivePrice() && (
                <span className="font-semibold">${getEffectivePrice()}</span>
              )}
              <Badge variant="outline" className="text-xs">Recommended</Badge>
            </div>
          </div>
          <Button size="sm" variant="outline">View</Button>
        </div>
        {product.tank_types && product.tank_types.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-1">Compatible with:</p>
            <div className="flex flex-wrap gap-1">
              {product.tank_types.slice(0, 2).map((type) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}
                </Badge>
              ))}
              {product.tank_types.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{product.tank_types.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderHomepagePreview = () => (
    <Card className="w-full max-w-lg">
      <div className="aspect-[16/9] relative overflow-hidden rounded-t-lg">
        <img
          src={product.image_url || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <Badge className="mb-2 bg-yellow-500">Featured</Badge>
          <h3 className="text-xl font-bold">{product.name}</h3>
          <p className="text-sm opacity-90">{product.category}</p>
        </div>
        <div className="absolute top-4 right-4">
          {getEffectivePrice() && (
            <Badge className="bg-green-500 text-white">
              ${getEffectivePrice()}
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description || "Premium quality equipment for your aquarium setup."}
        </p>
        <Button className="w-full mt-3">Learn More</Button>
      </CardContent>
    </Card>
  );

  const renderPreview = () => {
    switch (previewContext) {
      case 'shopping': return renderShoppingPreview();
      case 'wizard': return renderWizardPreview();
      case 'homepage': return renderHomepagePreview();
      default: return renderShoppingPreview();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Product Preview: {product.name}
          </DialogTitle>
          <DialogDescription>
            See how this product appears in different contexts across your site.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Preview Context:</label>
            <Select value={previewContext} onValueChange={setPreviewContext}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shopping">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Shopping Tab
                  </div>
                </SelectItem>
                <SelectItem value="wizard">
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-4 w-4" />
                    Setup Wizard
                  </div>
                </SelectItem>
                <SelectItem value="homepage">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Homepage Featured
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center p-8 bg-muted/30 rounded-lg">
            {renderPreview()}
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Preview Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Visibility:</span>
                <div className="flex gap-1 mt-1">
                  {product.visible && <Badge variant="outline" className="text-xs">Shop</Badge>}
                  {product.is_featured && <Badge variant="secondary" className="text-xs">Homepage</Badge>}
                  {product.is_recommended && <Badge variant="default" className="text-xs">Wizard</Badge>}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Pricing:</span>
                <div className="mt-1">
                  {product.is_on_sale && product.sale_price ? (
                    <span className="text-green-600 font-medium">${product.sale_price} (Sale)</span>
                  ) : product.regular_price ? (
                    <span className="font-medium">${product.regular_price}</span>
                  ) : (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
