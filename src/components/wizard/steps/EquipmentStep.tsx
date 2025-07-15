
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle, Wrench } from "lucide-react";
import { WizardData } from "../types";
import { EquipmentProductSelector } from "./EquipmentProductSelector";
import { useState } from "react";

interface EquipmentStepProps {
  data: WizardData;
  onUpdate: (updates: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const essentialEquipment = [
  { id: 'filter', name: 'Filter System', description: 'Essential for water quality', category: 'Filters' },
  { id: 'heater', name: 'Heater', description: 'Temperature control for tropical fish', category: 'Heating' },
  { id: 'lighting', name: 'LED Lighting', description: 'Proper illumination for fish and plants', category: 'Lights' },
  { id: 'substrate', name: 'Substrate', description: 'Gravel, sand, or specialized substrate', category: 'Substrate' },
  { id: 'airPump', name: 'Air Pump', description: 'Oxygenation and water circulation', category: 'Air' },
  { id: 'waterConditioner', name: 'Water Conditioner', description: 'Essential water treatment', category: 'Treatment' },
  { id: 'fishFood', name: 'Fish Food', description: 'Quality nutrition for your fish', category: 'Food' },
];

const optionalEquipment = [
  { id: 'decorations', name: 'Decorations', description: 'Caves, plants, and ornaments', category: 'Decorations' },
  { id: 'testKit', name: 'Water Test Kit', description: 'Monitor water parameters', category: 'Testing' },
  { id: 'maintenance', name: 'Maintenance Tools', description: 'Cleaning and maintenance equipment', category: 'Maintenance' },
];

export function EquipmentStep({ data, onUpdate, onNext, onPrev }: EquipmentStepProps) {
  const [selectedProducts, setSelectedProducts] = useState<Record<string, any>>({});

  const toggleEquipment = (equipmentId: string) => {
    const currentEquipment = data.equipment || [];
    const isSelected = currentEquipment.includes(equipmentId);
    
    const updatedEquipment = isSelected
      ? currentEquipment.filter(id => id !== equipmentId)
      : [...currentEquipment, equipmentId];
    
    onUpdate({ equipment: updatedEquipment });
  };

  const handleProductSelect = (equipmentId: string, productId: string | null, product: any) => {
    setSelectedProducts(prev => ({
      ...prev,
      [equipmentId]: product
    }));
  };

  const isEquipmentSelected = (equipmentId: string) => {
    return (data.equipment || []).includes(equipmentId);
  };

  const getTankType = () => {
    // Convert wizard tank goal to tank type for product filtering
    if (data.tankGoal?.includes('saltwater') || data.tankGoal?.includes('marine')) {
      return 'saltwater';
    }
    if (data.tankGoal?.includes('freshwater')) {
      return 'freshwater';
    }
    return undefined;
  };

  return (
    <div className="space-y-6 wizard-bg min-h-screen p-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2 text-foreground drop-shadow-lg">Equipment Selection</h2>
        <p className="text-muted-foreground drop-shadow">
          Choose products to purchase or mark what you already have
        </p>
      </div>

      {/* Essential Equipment */}
      <Card className="vibrant-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Essential Equipment</CardTitle>
          <CardDescription>
            These items are required for a healthy aquarium setup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {essentialEquipment.map((equipment) => (
            <div key={equipment.id} className="space-y-3">
              <div
                className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleEquipment(equipment.id)}
              >
                {isEquipmentSelected(equipment.id) ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className="font-medium">{equipment.name}</h4>
                  <p className="text-sm text-muted-foreground">{equipment.description}</p>
                </div>
                <Wrench className="h-4 w-4 text-muted-foreground mt-0.5" />
              </div>
              
              {isEquipmentSelected(equipment.id) && (
                <div className="ml-8 mr-4">
                  <EquipmentProductSelector
                    equipmentType={equipment.category}
                    tankType={getTankType()}
                    tankSize={data.tankSize}
                    onProductSelect={(productId, product) => 
                      handleProductSelect(equipment.id, productId, product)
                    }
                    selectedProductId={selectedProducts[equipment.id]?.id}
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Optional Equipment */}
      <Card className="vibrant-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Optional Equipment</CardTitle>
          <CardDescription>
            Additional items to enhance your aquarium experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {optionalEquipment.map((equipment) => (
            <div key={equipment.id} className="space-y-3">
              <div
                className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleEquipment(equipment.id)}
              >
                {isEquipmentSelected(equipment.id) ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className="font-medium">{equipment.name}</h4>
                  <p className="text-sm text-muted-foreground">{equipment.description}</p>
                </div>
                <Wrench className="h-4 w-4 text-muted-foreground mt-0.5" />
              </div>
              
              {isEquipmentSelected(equipment.id) && (
                <div className="ml-8 mr-4">
                  <EquipmentProductSelector
                    equipmentType={equipment.category}
                    tankType={getTankType()}
                    tankSize={data.tankSize}
                    onProductSelect={(productId, product) => 
                      handleProductSelect(equipment.id, productId, product)
                    }
                    selectedProductId={selectedProducts[equipment.id]?.id}
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="bg-card/90 backdrop-blur-sm border-border">
          Previous
        </Button>
        <Button 
          onClick={onNext}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
