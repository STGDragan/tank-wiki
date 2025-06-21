
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WizardStepProps } from "../types";
import { CategorizedSpeciesSelector } from "@/components/aquarium/species-selector/CategorizedSpeciesSelector";
import { ChevronLeft, HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { tankTypes } from "@/data/tankTypes";

export function TankGoalStep({ data, onUpdate, onNext, onPrev }: WizardStepProps) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>(data.selectedSpecies);

  const handleTankTypeSelect = (type: string) => {
    onUpdate({ tankGoal: type });
  };

  const handleSpeciesChange = (species: string) => {
    const newSpecies = selectedSpecies.includes(species) 
      ? selectedSpecies.filter(s => s !== species)
      : [...selectedSpecies, species];
    
    setSelectedSpecies(newSpecies);
    onUpdate({ selectedSpecies: newSpecies });
  };

  const getRecommendedSize = () => {
    if (selectedSpecies.length === 0) return "Select species to see recommendations";
    
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
    const speciesMultiplier = Math.max(1, selectedSpecies.length * 0.3);
    const recommendedSize = Math.ceil(baseSize * speciesMultiplier);
    
    return `Recommended minimum: ${recommendedSize} gallons`;
  };

  const QuizDialog = () => (
    <Dialog open={showQuiz} onOpenChange={setShowQuiz}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm">
          <HelpCircle className="h-4 w-4 mr-2" />
          Help Me Choose
        </Button>
      </DialogTrigger>
      <DialogContent className="vibrant-card">
        <DialogHeader>
          <DialogTitle className="dark:text-slate-100">Tank Type Quiz</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground dark:text-slate-400">Answer a few questions to find your ideal tank type:</p>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 dark:border-slate-700 dark:hover:bg-slate-800/50" onClick={() => { handleTankTypeSelect('Freshwater Community'); setShowQuiz(false); }}>
              <p className="font-medium dark:text-slate-200">I'm new to aquariums and want something easy</p>
              <p className="text-sm text-muted-foreground dark:text-slate-400">→ Freshwater Community Tank</p>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 dark:border-slate-700 dark:hover:bg-slate-800/50" onClick={() => { handleTankTypeSelect('Planted Freshwater'); setShowQuiz(false); }}>
              <p className="font-medium dark:text-slate-200">I want beautiful plants and natural look</p>
              <p className="text-sm text-muted-foreground dark:text-slate-400">→ Planted Freshwater Tank</p>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 dark:border-slate-700 dark:hover:bg-slate-800/50" onClick={() => { handleTankTypeSelect('Saltwater Fish-Only'); setShowQuiz(false); }}>
              <p className="font-medium dark:text-slate-200">I want colorful marine fish</p>
              <p className="text-sm text-muted-foreground dark:text-slate-400">→ Saltwater Fish-Only Tank</p>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 dark:border-slate-700 dark:hover:bg-slate-800/50" onClick={() => { handleTankTypeSelect('Soft Coral Reef'); setShowQuiz(false); }}>
              <p className="font-medium dark:text-slate-200">I want corals but nothing too difficult</p>
              <p className="text-sm text-muted-foreground dark:text-slate-400">→ Soft Coral Reef Tank</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6 wizard-bg min-h-screen p-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2 text-white drop-shadow-lg">What kind of aquarium do you want to build?</h2>
        <div className="flex justify-center">
          <QuizDialog />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {tankTypes.map((type) => {
          const isSelected = data.tankGoal === type.value;
          
          return (
            <Card 
              key={type.value}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 border-2 vibrant-card ${
                isSelected 
                  ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-500' 
                  : 'hover:shadow-md dark:hover:bg-slate-700/50'
              }`}
              onClick={() => handleTankTypeSelect(type.value)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{type.emoji}</span>
                  <CardTitle className="text-base text-foreground dark:text-slate-100">{type.label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground dark:text-slate-300">{type.description}</p>
                {type.categories && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {type.categories.slice(0, 2).map(category => (
                      <Badge key={category} variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                    {type.categories.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{type.categories.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
                {isSelected && (
                  <Badge className="mt-2 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700">Selected</Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {data.tankGoal && (
        <Card className="vibrant-card">
          <CardHeader>
            <CardTitle className="text-lg text-foreground dark:text-slate-100">Select Your Species</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CategorizedSpeciesSelector
              value={selectedSpecies}
              onChange={handleSpeciesChange}
              aquariumType={data.tankGoal}
            />
            
            {selectedSpecies.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{getRecommendedSize()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="bg-white/90 backdrop-blur-sm">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!data.tankGoal}
          className="btn-vibrant"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
