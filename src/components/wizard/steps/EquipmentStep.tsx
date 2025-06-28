
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
  { id: 'filter', name: 'Filter System', description: 'Essential for water quality' },
  { id: 'heater', name: 'Heater', description: 'Temperature control for tropical fish' },
  { id: 'lighting', name: 'LED Lighting', description: 'Proper illumination for fish and plants' },
  { id: 'airPump', name: 'Air Pump', description: 'Oxygenation and water circulation' },
];

const optionalEquipment = [
  { id: 'substrate', name: 'Substrate', description: 'Gravel, sand, or specialized substrate' },
  { id: 'decorations', name: 'Decorations', description: 'Caves, plants, and ornaments' },
  { id: 'waterConditioner', name: 'Water Conditioner', description: 'Treatment chemicals' },
  { id: 'foodFlakes', name: 'Fish Food', description: 'Quality nutrition for your fish' },
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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Essential Equipment</h2>
        <p className="text-muted-foreground">
          Select the equipment you'll need for your aquarium setup
        </p>
      </div>

      {/* Essential Equipment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Required Equipment</CardTitle>
          <CardDescription>
            These items are essential for a healthy aquarium
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
                    equipmentType={equipment.name}
                    tankType={getTankType()}
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Optional Equipment</CardTitle>
          <CardDescription>
            Additional items to enhance your aquarium
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
                    equipmentType={equipment.name}
                    tankType={getTankType()}
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
        <Button onClick={onPrev} variant="outline">
          Previous
        </Button>
        <Button onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}
