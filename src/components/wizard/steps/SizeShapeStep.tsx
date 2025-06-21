
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { WizardStepProps } from "../types";
import { ChevronLeft, Info, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getTankDimensions } from "@/data/tankDimensions";

export function SizeShapeStep({ data, onUpdate, onNext, onPrev }: WizardStepProps) {
  const [dimensions, setDimensions] = useState<{ length: number; width: number; height: number; shape: string } | null>(null);

  const tankShapes = [
    {
      value: 'rectangular',
      label: 'Rectangular',
      description: 'Most common, great surface area',
      dimensions: '48" × 12" × 20"',
      image: '🔲'
    },
    {
      value: 'bow-front',
      label: 'Bow Front',
      description: 'Curved front for better viewing',
      dimensions: '48" × 15" × 20"',
      image: '🌙'
    },
    {
      value: 'corner',
      label: 'Corner',
      description: 'Space-saving corner design',
      dimensions: '24" × 24" × 20"',
      image: '📐'
    },
    {
      value: 'cube',
      label: 'Cube',
      description: 'Modern square design',
      dimensions: '18" × 18" × 18"',
      image: '⬜'
    }
  ];

  const getRecommendedSize = () => {
    const baseSizes: { [key: string]: number } = {
      'Freshwater Community': 20,
      'Planted Freshwater': 20,
      'Freshwater Shrimp': 10,
      'Saltwater Fish-Only': 40,
      'FOWLR': 40,
      'Soft Coral Reef': 40,
      'Mixed Reef': 50,
      'SPS Reef': 75,
      'Cichlid Tank': 55,
      'Nano Reef': 20
    };
    
    const baseSize = baseSizes[data.tankGoal] || 20;
    const speciesMultiplier = Math.max(1, data.selectedSpecies.length * 0.3);
    return Math.ceil(baseSize * speciesMultiplier);
  };

  const recommendedSize = getRecommendedSize();

  // Auto-populate dimensions when size changes
  useEffect(() => {
    if (data.tankSize) {
      const tankDimensions = getTankDimensions(data.tankSize);
      if (tankDimensions) {
        setDimensions(tankDimensions);
        // Auto-select shape if dimensions found
        if (!data.tankShape) {
          onUpdate({ tankShape: tankDimensions.shape });
        }
      }
    }
  }, [data.tankSize, data.tankShape, onUpdate]);

  // Set recommended size as default when component loads if no size is set
  useEffect(() => {
    if (!data.tankSize && recommendedSize) {
      onUpdate({ tankSize: recommendedSize });
    }
  }, [data.tankSize, recommendedSize, onUpdate]);

  const handleSizeChange = (size: string) => {
    const numSize = parseInt(size) || 0;
    onUpdate({ tankSize: numSize });
  };

  const handleShapeSelect = (shape: string) => {
    onUpdate({ tankShape: shape });
  };

  const handleUseRecommendedSize = () => {
    onUpdate({ tankSize: recommendedSize });
  };

  return (
    <div className="space-y-6 wizard-bg min-h-screen p-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2 text-white drop-shadow-lg">Choose Your Tank Size & Shape</h2>
        <p className="text-white/90 drop-shadow">Based on your selected species and tank type</p>
      </div>

      <Card className="vibrant-card">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-blue-800 dark:text-blue-200">Recommended Size: {recommendedSize} gallons</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Based on your {data.tankGoal.toLowerCase()} setup with {data.selectedSpecies.length} species selected.
                Larger is always better for stability!
              </p>
              {data.tankSize !== recommendedSize && (
                <Button 
                  size="sm" 
                  className="mt-3 btn-vibrant"
                  onClick={handleUseRecommendedSize}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Use Recommended Size
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="vibrant-card">
          <CardContent className="pt-6">
            <div>
              <Label htmlFor="tank-size" className="text-foreground dark:text-slate-200">Tank Size (gallons) *</Label>
              <Input
                id="tank-size"
                type="number"
                value={data.tankSize || ''}
                onChange={(e) => handleSizeChange(e.target.value)}
                placeholder={`Recommended: ${recommendedSize}`}
                min="1"
                className="mt-1 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
                required
              />
              {data.tankSize && data.tankSize < recommendedSize && (
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                  ⚠️ This size may be too small for your selected species. Consider going larger.
                </p>
              )}
              {data.tankSize === recommendedSize && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Perfect! Using our recommended size.
                </p>
              )}
              
              {dimensions && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Standard Dimensions: {dimensions.length}" L × {dimensions.width}" W × {dimensions.height}" H
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    Shape: {dimensions.shape.replace('-', ' ')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="vibrant-card">
          <CardHeader>
            <CardTitle>Tank Shape</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {tankShapes.map((shape) => {
                const isSelected = data.tankShape === shape.value;
                const isRecommended = dimensions?.shape === shape.value;
                
                return (
                  <Card 
                    key={shape.value}
                    className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                      isSelected 
                        ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-500' 
                        : isRecommended 
                        ? 'ring-1 ring-green-400 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-600'
                        : 'hover:shadow-md dark:hover:bg-slate-700/50'
                    }`}
                    onClick={() => handleShapeSelect(shape.value)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{shape.image}</span>
                        <div>
                          <CardTitle className="text-base text-foreground dark:text-slate-100">{shape.label}</CardTitle>
                          <p className="text-xs text-muted-foreground dark:text-slate-400">{shape.dimensions}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground dark:text-slate-300">{shape.description}</p>
                      <div className="flex gap-2 mt-2">
                        {isSelected && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700">Selected</Badge>
                        )}
                        {isRecommended && !isSelected && (
                          <Badge variant="outline" className="border-green-400 text-green-700 dark:border-green-600 dark:text-green-400">
                            Recommended
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="bg-white/90 backdrop-blur-sm">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={onNext}
          disabled={!data.tankSize || !data.tankShape}
          className="btn-vibrant"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
