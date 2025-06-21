import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { WizardStepProps } from "../types";
import { ChevronLeft, ShoppingCart, Skip } from "lucide-react";

export function EquipmentStep({ data, onUpdate, onNext, onPrev }: WizardStepProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(data.equipment);

  const getEquipmentForTankType = () => {
    const baseEquipment = [
      { name: 'Filter', essential: true, description: 'Keeps water clean and healthy' },
      { name: 'Heater', essential: true, description: 'Maintains stable temperature' },
      { name: 'Thermometer', essential: true, description: 'Monitor water temperature' },
      { name: 'Water Conditioner', essential: true, description: 'Makes tap water safe' },
      { name: 'Test Kit', essential: true, description: 'Monitor water parameters' },
      { name: 'Substrate', essential: false, description: 'Gravel, sand, or soil' },
      { name: 'Decorations', essential: false, description: 'Caves, rocks, driftwood' }
    ];

    if (data.tankGoal.includes('Planted')) {
      baseEquipment.push(
        { name: 'LED Plant Light', essential: true, description: 'Full spectrum for plant growth' },
        { name: 'CO2 System', essential: false, description: 'Boosts plant growth' },
        { name: 'Plant Fertilizer', essential: false, description: 'Nutrients for plants' }
      );
    } else if (data.tankGoal.includes('Saltwater') || data.tankGoal.includes('Reef')) {
      baseEquipment.push(
        { name: 'Protein Skimmer', essential: true, description: 'Removes organic waste' },
        { name: 'Marine Salt Mix', essential: true, description: 'Create saltwater' },
        { name: 'Powerhead', essential: true, description: 'Water circulation' },
        { name: 'Marine LED Light', essential: data.tankGoal.includes('Reef'), description: 'For coral growth' }
      );
    } else {
      baseEquipment.push(
        { name: 'LED Light', essential: false, description: 'Standard aquarium lighting' }
      );
    }

    return baseEquipment;
  };

  const equipment = getEquipmentForTankType();
  const essentialEquipment = equipment.filter(eq => eq.essential);
  const optionalEquipment = equipment.filter(eq => !eq.essential);

  const handleEquipmentToggle = (equipmentName: string) => {
    const newSelection = selectedEquipment.includes(equipmentName)
      ? selectedEquipment.filter(eq => eq !== equipmentName)
      : [...selectedEquipment, equipmentName];
    
    setSelectedEquipment(newSelection);
    onUpdate({ equipment: newSelection });
  };

  const selectAllEssential = () => {
    const essentialNames = essentialEquipment.map(eq => eq.name);
    const newSelection = [...new Set([...selectedEquipment, ...essentialNames])];
    setSelectedEquipment(newSelection);
    onUpdate({ equipment: newSelection });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Equipment Selection</h2>
        <p className="text-muted-foreground">Choose the equipment for your {data.tankGoal.toLowerCase()}</p>
      </div>

      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-red-800">Essential Equipment</CardTitle>
            <Button size="sm" onClick={selectAllEssential} variant="outline">
              Select All Essential
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {essentialEquipment.map((item) => (
            <div key={item.name} className="flex items-center space-x-3 p-3 border rounded-lg bg-white">
              <Checkbox
                checked={selectedEquipment.includes(item.name)}
                onCheckedChange={() => handleEquipmentToggle(item.name)}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{item.name}</p>
                  <Badge variant="destructive" className="text-xs">Essential</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Optional Equipment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {optionalEquipment.map((item) => (
            <div key={item.name} className="flex items-center space-x-3 p-3 border rounded-lg">
              <Checkbox
                checked={selectedEquipment.includes(item.name)}
                onCheckedChange={() => handleEquipmentToggle(item.name)}
              />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {selectedEquipment.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-800">Selected Equipment ({selectedEquipment.length})</p>
                <p className="text-sm text-blue-700">Add these items to your shopping list</p>
              </div>
              <Button size="sm" variant="outline">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onNext}>
            <Skip className="h-4 w-4 mr-2" />
            Skip & Do Later
          </Button>
          <Button onClick={onNext}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
