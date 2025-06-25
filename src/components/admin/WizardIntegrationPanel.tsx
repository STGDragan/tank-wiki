
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Wand2 } from "lucide-react";

interface WizardIntegrationPanelProps {
  products: Tables<'products'>[];
  onUpdate: (params: { productId: string; updates: Partial<Tables<'products'>> }) => void;
}

const tankTypes = [
  "Freshwater Community", "Saltwater Reef", "Saltwater FOWLR", "Planted Tank", 
  "Cichlid Tank", "Nano Tank", "Breeding Tank", "Quarantine Tank"
];

const equipmentCategories = [
  "Filtration", "Lighting", "Heating", "Circulation", "Testing", "Maintenance", "Decoration"
];

const sizeRanges = [
  "Nano (5-20 gal)", "Small (21-50 gal)", "Medium (51-100 gal)", "Large (101-200 gal)", "XL (200+ gal)"
];

export const WizardIntegrationPanel = ({ products, onUpdate }: WizardIntegrationPanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Tables<'products'> | null>(null);
  const [wizardSettings, setWizardSettings] = useState({
    compatible_tank_types: [] as string[],
    size_compatibility: [] as string[],
    equipment_category: "",
    min_tank_size: "",
    max_tank_size: "",
    compatibility_notes: ""
  });

  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSelect = (product: Tables<'products'>) => {
    setSelectedProduct(product);
    // Load existing wizard settings from product data
    setWizardSettings({
      compatible_tank_types: product.tank_types || [],
      size_compatibility: [], // This would come from a new field
      equipment_category: product.category || "",
      min_tank_size: product.min_tank_size || "",
      max_tank_size: product.max_size || "",
      compatibility_notes: "" // This would come from a new field
    });
  };

  const handleSaveWizardSettings = () => {
    if (!selectedProduct) return;

    onUpdate({
      productId: selectedProduct.id,
      updates: {
        tank_types: wizardSettings.compatible_tank_types,
        min_tank_size: wizardSettings.min_tank_size,
        max_size: wizardSettings.max_tank_size,
        // Note: Some fields might need to be added to the database schema
      }
    });
    setSelectedProduct(null);
  };

  const handleTankTypeToggle = (tankType: string, checked: boolean) => {
    setWizardSettings(prev => ({
      ...prev,
      compatible_tank_types: checked 
        ? [...prev.compatible_tank_types, tankType]
        : prev.compatible_tank_types.filter(t => t !== tankType)
    }));
  };

  const handleSizeRangeToggle = (sizeRange: string, checked: boolean) => {
    setWizardSettings(prev => ({
      ...prev,
      size_compatibility: checked 
        ? [...prev.size_compatibility, sizeRange]
        : prev.size_compatibility.filter(s => s !== sizeRange)
    }));
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
            Configure how products appear in setup wizards and equipment recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products to configure..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div 
                      key={product.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedProduct?.id === product.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{product.name}</h4>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                          <div className="flex gap-1 mt-1">
                            {product.is_recommended && (
                              <Badge variant="default" className="text-xs">In Wizard</Badge>
                            )}
                            {product.tank_types && product.tank_types.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {product.tank_types.length} tank types
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Wizard Configuration</CardTitle>
                {selectedProduct && (
                  <CardDescription>
                    Configuring: {selectedProduct.name}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {selectedProduct ? (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium">Compatible Tank Types</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {tankTypes.map((tankType) => (
                          <div key={tankType} className="flex items-center space-x-2">
                            <Checkbox
                              id={tankType}
                              checked={wizardSettings.compatible_tank_types.includes(tankType)}
                              onCheckedChange={(checked) => handleTankTypeToggle(tankType, checked as boolean)}
                            />
                            <Label htmlFor={tankType} className="text-xs">{tankType}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Size Compatibility</Label>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {sizeRanges.map((sizeRange) => (
                          <div key={sizeRange} className="flex items-center space-x-2">
                            <Checkbox
                              id={sizeRange}
                              checked={wizardSettings.size_compatibility.includes(sizeRange)}
                              onCheckedChange={(checked) => handleSizeRangeToggle(sizeRange, checked as boolean)}
                            />
                            <Label htmlFor={sizeRange} className="text-xs">{sizeRange}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="min-size" className="text-sm font-medium">Min Tank Size</Label>
                        <Input
                          id="min-size"
                          placeholder="e.g., 20 gallons"
                          value={wizardSettings.min_tank_size}
                          onChange={(e) => setWizardSettings(prev => ({ ...prev, min_tank_size: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-size" className="text-sm font-medium">Max Tank Size</Label>
                        <Input
                          id="max-size"
                          placeholder="e.g., 200 gallons"
                          value={wizardSettings.max_tank_size}
                          onChange={(e) => setWizardSettings(prev => ({ ...prev, max_tank_size: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="equipment-category" className="text-sm font-medium">Equipment Category</Label>
                      <Select 
                        value={wizardSettings.equipment_category} 
                        onValueChange={(value) => setWizardSettings(prev => ({ ...prev, equipment_category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipmentCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="compatibility-notes" className="text-sm font-medium">Compatibility Notes</Label>
                      <Textarea
                        id="compatibility-notes"
                        placeholder="Special compatibility requirements or notes..."
                        value={wizardSettings.compatibility_notes}
                        onChange={(e) => setWizardSettings(prev => ({ ...prev, compatibility_notes: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSaveWizardSettings}>
                        Save Configuration
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Select a product to configure its wizard integration settings.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
