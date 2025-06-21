
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { WizardStepProps } from "../types";
import { ChevronLeft, Info, CheckCircle } from "lucide-react";
import { useEffect } from "react";

export function SizeShapeStep({ data, onUpdate, onNext, onPrev }: WizardStepProps) {
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
      'Freshwater': 20,
      'Planted Freshwater': 20,
      'Freshwater Invertebrates': 10,
      'Saltwater Fish-Only (FO)': 40,
      'Fish-Only with Live Rock (FOWLR)': 40,
      'Soft Coral Reef': 40,
      'Mixed Reef (LPS + Soft)': 50,
      'SPS Reef (Hard Coral)': 75
    };
    
    const baseSize = baseSizes[data.tankGoal] || 20;
    const speciesMultiplier = Math.max(1, data.selectedSpecies.length * 0.3);
    return Math.ceil(baseSize * speciesMultiplier);
  };

  const recommendedSize = getRecommendedSize();

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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2 text-foreground dark:text-slate-100">Choose Your Tank Size & Shape</h2>
        <p className="text-muted-foreground dark:text-slate-400">Based on your selected species and tank type</p>
      </div>

      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700">
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
                  className="mt-3"
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
        </div>

        <div>
          <Label className="text-foreground dark:text-slate-200">Tank Shape</Label>
          <div className="grid gap-3 md:grid-cols-2 mt-2">
            {tankShapes.map((shape) => {
              const isSelected = data.tankShape === shape.value;
              
              return (
                <Card 
                  key={shape.value}
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 dark:bg-slate-800/50 dark:border-slate-600 ${
                    isSelected 
                      ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-500' 
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
                    {isSelected && (
                      <Badge className="mt-2 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700">Selected</Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={onNext}
          disabled={!data.tankSize || !data.tankShape}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
