
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
import { Search, Settings, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductVisibilityControlsProps {
  products: Tables<'products'>[];
  onUpdate: (params: { productId: string; updates: Partial<Tables<'products'>> }) => void;
}

export const ProductVisibilityControls = ({ products, onUpdate }: ProductVisibilityControlsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isApplyingBulk, setIsApplyingBulk] = useState(false);
  const [bulkSettings, setBulkSettings] = useState({
    visible: false,
    is_featured: false,
    is_recommended: false,
    is_on_sale: false
  });

  const { toast } = useToast();

  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVisibilityToggle = (product: Tables<'products'>, field: keyof Tables<'products'>, value: boolean) => {
    console.log('Updating product visibility:', { productId: product.id, field, value });
    onUpdate({
      productId: product.id,
      updates: { [field]: value }
    });
  };

  const applyBulkSettings = async () => {
    if (filteredProducts.length === 0) {
      toast({ 
        title: 'No Products', 
        description: 'No products match the current filter.',
        variant: 'destructive'
      });
      return;
    }

    setIsApplyingBulk(true);
    console.log('Applying bulk settings to', filteredProducts.length, 'products:', bulkSettings);

    try {
      // Apply settings to each filtered product
      for (const product of filteredProducts) {
        onUpdate({
          productId: product.id,
          updates: bulkSettings
        });
        // Small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast({ 
        title: 'Bulk Update Applied', 
        description: `Updated ${filteredProducts.length} products successfully.` 
      });
    } catch (error) {
      console.error('Error applying bulk settings:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to apply bulk settings to all products.',
        variant: 'destructive'
      });
    } finally {
      setIsApplyingBulk(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Settings className="h-5 w-5 text-primary" />
            Product Visibility Controls
          </CardTitle>
          <CardDescription className="font-mono">
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
                className="pl-10 cyber-input"
              />
            </div>
            <Button 
              onClick={applyBulkSettings} 
              variant="outline" 
              className="cyber-button"
              disabled={isApplyingBulk || filteredProducts.length === 0}
            >
              {isApplyingBulk && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Apply to {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''}
            </Button>
          </div>

          <Card className="border-dashed glass-panel neon-border">
            <CardHeader>
              <CardTitle className="text-sm font-display">Bulk Visibility Settings</CardTitle>
              <CardDescription className="font-mono text-xs">
                These settings will be applied to all {filteredProducts.length} filtered products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="bulk-visible"
                    checked={bulkSettings.visible}
                    onCheckedChange={(checked) => setBulkSettings(prev => ({ ...prev, visible: checked }))}
                  />
                  <Label htmlFor="bulk-visible" className="font-mono">Show in Shop</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="bulk-featured"
                    checked={bulkSettings.is_featured}
                    onCheckedChange={(checked) => setBulkSettings(prev => ({ ...prev, is_featured: checked }))}
                  />
                  <Label htmlFor="bulk-featured" className="font-mono">Feature on Homepage</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="bulk-recommended"
                    checked={bulkSettings.is_recommended}
                    onCheckedChange={(checked) => setBulkSettings(prev => ({ ...prev, is_recommended: checked }))}
                  />
                  <Label htmlFor="bulk-recommended" className="font-mono">Show in Wizard</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="bulk-sale"
                    checked={bulkSettings.is_on_sale}
                    onCheckedChange={(checked) => setBulkSettings(prev => ({ ...prev, is_on_sale: checked }))}
                  />
                  <Label htmlFor="bulk-sale" className="font-mono">Mark on Sale</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {filteredProducts.length === 0 ? (
              <Card className="glass-panel neon-border">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground font-mono">
                    {searchTerm ? `No products match "${searchTerm}"` : 'No products found'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredProducts.map((product) => (
                <Card key={product.id} className="glass-panel neon-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          className="w-12 h-12 rounded-md object-cover neon-border"
                        />
                        <div>
                          <h3 className="font-medium font-mono">{product.name}</h3>
                          <p className="text-sm text-muted-foreground font-mono">{product.category} • {product.subcategory}</p>
                          <div className="flex gap-1 mt-1">
                            {product.visible && <Badge variant="outline" className="text-xs neon-border">Shop</Badge>}
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
                          <Label className="text-sm font-mono">Shop</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={product.is_featured || false}
                            onCheckedChange={(checked) => handleVisibilityToggle(product, 'is_featured', checked)}
                          />
                          <Label className="text-sm font-mono">Homepage</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={product.is_recommended || false}
                            onCheckedChange={(checked) => handleVisibilityToggle(product, 'is_recommended', checked)}
                          />
                          <Label className="text-sm font-mono">Wizard</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={product.is_on_sale || false}
                            onCheckedChange={(checked) => handleVisibilityToggle(product, 'is_on_sale', checked)}
                          />
                          <Label className="text-sm font-mono">Sale</Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
