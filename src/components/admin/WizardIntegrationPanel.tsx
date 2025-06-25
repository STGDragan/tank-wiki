
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Settings, Wand2 } from "lucide-react";

interface WizardIntegrationPanelProps {
  products: Tables<'products'>[];
  onUpdate: (params: { productId: string; updates: Partial<Tables<'products'>> }) => void;
}

export const WizardIntegrationPanel = ({ products, onUpdate }: WizardIntegrationPanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Define the valid tank types as const to match the database enum
  const validTankTypes = [
    'freshwater_community',
    'african_cichlid', 
    'planted_low_tech',
    'planted_high_tech',
    'brackish',
    'freshwater_nano',
    'saltwater_fo',
    'fowlr',
    'reef_soft_coral',
    'reef_lps',
    'reef_sps',
    'reef_mixed'
  ] as const;

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products?.map(p => p.category).filter(Boolean))) as string[];

  const handleTankTypeToggle = (product: Tables<'products'>, tankType: string, checked: boolean) => {
    const currentTypes = product.tank_types || [];
    let newTypes: string[];
    
    if (checked) {
      newTypes = [...currentTypes, tankType];
    } else {
      newTypes = currentTypes.filter(type => type !== tankType);
    }

    // Type assertion to match the expected database type
    const validatedTypes = newTypes.filter(type => 
      validTankTypes.includes(type as any)
    ) as typeof validTankTypes[number][];

    onUpdate({
      productId: product.id,
      updates: { tank_types: validatedTypes }
    });
  };

  const getTankTypeLabel = (tankType: string) => {
    const labels: Record<string, string> = {
      'freshwater_community': 'Freshwater Community',
      'african_cichlid': 'African Cichlid',
      'planted_low_tech': 'Planted Low-Tech',
      'planted_high_tech': 'Planted High-Tech',
      'brackish': 'Brackish',
      'freshwater_nano': 'Freshwater Nano',
      'saltwater_fo': 'Saltwater Fish Only',
      'fowlr': 'Fish Only with Live Rock',
      'reef_soft_coral': 'Reef Soft Coral',
      'reef_lps': 'Reef LPS',
      'reef_sps': 'Reef SPS',
      'reef_mixed': 'Reef Mixed'
    };
    return labels[tankType] || tankType;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Setup Wizard Integration
          </CardTitle>
          <CardDescription>
            Configure which products appear in the aquarium setup wizard and their compatibility settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products for wizard integration..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                        <div className="flex gap-1 mt-1">
                          {product.is_recommended && (
                            <Badge variant="default" className="text-xs">Wizard Recommended</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={product.is_recommended || false}
                        onCheckedChange={(checked) => onUpdate({
                          productId: product.id,
                          updates: { is_recommended: checked }
                        })}
                      />
                      <Label className="text-sm">Show in Wizard</Label>
                    </div>
                  </div>

                  {product.is_recommended && (
                    <div className="space-y-4 pl-16 border-l-2 border-muted">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Tank Type Compatibility</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {validTankTypes.map((tankType) => (
                            <div key={tankType} className="flex items-center space-x-2">
                              <Switch
                                checked={(product.tank_types || []).includes(tankType)}
                                onCheckedChange={(checked) => handleTankTypeToggle(product, tankType, checked)}
                              />
                              <Label className="text-xs">{getTankTypeLabel(tankType)}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">Minimum Tank Size</Label>
                          <Input
                            value={product.min_tank_size || ''}
                            onChange={(e) => onUpdate({
                              productId: product.id,
                              updates: { min_tank_size: e.target.value }
                            })}
                            placeholder="e.g., 20 gallons"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Maximum Size</Label>
                          <Input
                            value={product.max_size || ''}
                            onChange={(e) => onUpdate({
                              productId: product.id,
                              updates: { max_size: e.target.value }
                            })}
                            placeholder="e.g., 6 inches"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      {product.is_livestock && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm">Care Level</Label>
                            <Select 
                              value={product.care_level || ''} 
                              onValueChange={(value) => onUpdate({
                                productId: product.id,
                                updates: { care_level: value }
                              })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select care level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                                <SelectItem value="expert">Expert</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-sm">Difficulty Level</Label>
                            <Select 
                              value={product.difficulty_level || ''} 
                              onValueChange={(value) => onUpdate({
                                productId: product.id,
                                updates: { difficulty_level: value as any }
                              })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select difficulty" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No products found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
