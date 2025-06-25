
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Settings } from "lucide-react";

interface ProductVisibilityControlsProps {
  products: Tables<'products'>[];
  onUpdate: (params: { productId: string; updates: Partial<Tables<'products'>> }) => void;
}

export const ProductVisibilityControls = ({ products, onUpdate }: ProductVisibilityControlsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkSettings, setBulkSettings] = useState({
    visible: false,
    is_featured: false,
    is_recommended: false,
    is_on_sale: false
  });

  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVisibilityToggle = (product: Tables<'products'>, field: keyof Tables<'products'>, value: boolean) => {
    onUpdate({
      productId: product.id,
      updates: { [field]: value }
    });
  };

  const applyBulkSettings = () => {
    filteredProducts.forEach(product => {
      onUpdate({
        productId: product.id,
        updates: bulkSettings
      });
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Product Visibility Controls
          </CardTitle>
          <CardDescription>
            Control where your products appear across the site - shopping tab, setup wizard, homepage features, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={applyBulkSettings} variant="outline">
              Apply Bulk Settings
            </Button>
          </div>

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-sm">Bulk Visibility Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="bulk-visible"
                    checked={bulkSettings.visible}
                    onCheckedChange={(checked) => setBulkSettings(prev => ({ ...prev, visible: checked }))}
                  />
                  <Label htmlFor="bulk-visible">Show in Shop</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="bulk-featured"
                    checked={bulkSettings.is_featured}
                    onCheckedChange={(checked) => setBulkSettings(prev => ({ ...prev, is_featured: checked }))}
                  />
                  <Label htmlFor="bulk-featured">Feature on Homepage</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="bulk-recommended"
                    checked={bulkSettings.is_recommended}
                    onCheckedChange={(checked) => setBulkSettings(prev => ({ ...prev, is_recommended: checked }))}
                  />
                  <Label htmlFor="bulk-recommended">Show in Wizard</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="bulk-sale"
                    checked={bulkSettings.is_on_sale}
                    onCheckedChange={(checked) => setBulkSettings(prev => ({ ...prev, is_on_sale: checked }))}
                  />
                  <Label htmlFor="bulk-sale">Mark on Sale</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.category} • {product.subcategory}</p>
                      <div className="flex gap-1 mt-1">
                        {product.visible && <Badge variant="outline" className="text-xs">Shop</Badge>}
                        {product.is_featured && <Badge variant="secondary" className="text-xs">Homepage</Badge>}
                        {product.is_recommended && <Badge variant="default" className="text-xs">Wizard</Badge>}
                        {product.is_on_sale && <Badge variant="destructive" className="text-xs">Sale</Badge>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={product.visible || false}
                        onCheckedChange={(checked) => handleVisibilityToggle(product, 'visible', checked)}
                      />
                      <Label className="text-sm">Shop</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={product.is_featured || false}
                        onCheckedChange={(checked) => handleVisibilityToggle(product, 'is_featured', checked)}
                      />
                      <Label className="text-sm">Homepage</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={product.is_recommended || false}
                        onCheckedChange={(checked) => handleVisibilityToggle(product, 'is_recommended', checked)}
                      />
                      <Label className="text-sm">Wizard</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={product.is_on_sale || false}
                        onCheckedChange={(checked) => handleVisibilityToggle(product, 'is_on_sale', checked)}
                      />
                      <Label className="text-sm">Sale</Label>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
