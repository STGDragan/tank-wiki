
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ShoppingCart, Heart } from "lucide-react";
import { saltwaterRecommendations, freshwaterRecommendations } from "@/data/recommendations";

const PlaceholderProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find the product in both recommendation arrays
  const allRecommendations = [...saltwaterRecommendations, ...freshwaterRecommendations];
  const product = allRecommendations.find(item => item.productId === id);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-muted-foreground mb-4">Product Not Found</h1>
        <Button onClick={() => navigate('/shopping')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shopping
        </Button>
      </div>
    );
  }

  const effectivePrice = product.salePrice || product.price;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <Button
        variant="ghost"
        onClick={() => navigate('/shopping')}
        className="mb-6 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Shopping
      </Button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="capitalize">{product.type}</Badge>
              {product.sale && (
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                  Sale
                </Badge>
              )}
              {product.featured && (
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                  Featured
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          </div>

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {effectivePrice && (
                <span className="text-3xl font-bold text-primary">
                  ${effectivePrice.toFixed(2)}
                </span>
              )}
              
              {product.sale && product.price && product.salePrice && (
                <span className="text-xl text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
            
            {product.sale && product.price && product.salePrice && (
              <div className="text-green-600 font-medium">
                Save ${(product.price - product.salePrice).toFixed(2)} ({Math.round(((product.price - product.salePrice) / product.price) * 100)}% off)
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button className="flex-1">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
              
              <Button variant="outline">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              This is a placeholder product page for demonstration purposes.
            </p>
          </div>

          {/* Product Details */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Product Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="capitalize">{product.type}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product ID:</span>
                  <span className="font-mono text-sm">{product.productId}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderProduct;
