
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { Search, Settings, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WizardIntegrationPanelProps {
  products: Tables<'products'>[];
  onUpdate: (params: { productId: string; updates: Partial<Tables<'products'>> }) => void;
}

export const WizardIntegrationPanel = ({ products, onUpdate }: WizardIntegrationPanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, updates }: { productId: string; updates: Partial<Tables<'products'>> }) => {
      console.log('Updating product:', productId, updates);
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId);

      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Success', description: 'Product updated successfully.' });
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast({ title: 'Error', description: 'Failed to update product.', variant: 'destructive' });
    }
  });

  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRecommendedToggle = (product: Tables<'products'>, value: boolean) => {
    console.log('Toggling recommended for product:', product.id, value);
    updateProductMutation.mutate({
      productId: product.id,
      updates: { is_recommended: value }
    });
    // Also call the parent's onUpdate for immediate UI feedback
    onUpdate({
      productId: product.id,
      updates: { is_recommended: value }
    });
  };

  const bulkEnableRecommended = () => {
    filteredProducts.forEach(product => {
      updateProductMutation.mutate({
        productId: product.id,
        updates: { is_recommended: true }
      });
    });
  };

  const bulkDisableRecommended = () => {
    filteredProducts.forEach(product => {
      updateProductMutation.mutate({
        productId: product.id,
        updates: { is_recommended: false }
      });
    });
  };

  return (
    <div className="space-y-6">
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Wand2 className="h-5 w-5 text-primary" />
            Wizard Integration Panel
          </CardTitle>
          <CardDescription className="font-mono">
            Control which products appear in the setup wizard recommendations for new aquarium owners.
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
            <div className="flex gap-2">
              <Button onClick={bulkEnableRecommended} variant="outline" className="cyber-button">
                Enable All
              </Button>
              <Button onClick={bulkDisableRecommended} variant="outline" className="cyber-button">
                Disable All
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="p-4 glass-panel neon-border">
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
                        {product.is_recommended && <Badge variant="default" className="text-xs font-mono">Wizard</Badge>}
                        {product.is_featured && <Badge variant="secondary" className="text-xs font-mono">Featured</Badge>}
                        {product.visible && <Badge variant="outline" className="text-xs font-mono">Shop</Badge>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={product.is_recommended || false}
                      onCheckedChange={(checked) => handleRecommendedToggle(product, checked)}
                      disabled={updateProductMutation.isPending}
                    />
                    <Label className="text-sm font-mono">Show in Wizard</Label>
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
