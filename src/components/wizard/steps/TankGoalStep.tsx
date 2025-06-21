
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WizardStepProps } from "../types";
import { SpeciesSelector } from "@/components/aquarium/SpeciesSelector";
import { ChevronLeft, HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function TankGoalStep({ data, onUpdate, onNext, onPrev }: WizardStepProps) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>(data.selectedSpecies);

  const tankTypes = [
    {
      value: 'Freshwater',
      label: 'Freshwater Community',
      description: 'Perfect for beginners, easy maintenance',
      emoji: '🐠'
    },
    {
      value: 'Planted Freshwater',
      label: 'Planted Freshwater',
      description: 'Beautiful aquascapes with live plants',
      emoji: '🌱'
    },
    {
      value: 'Freshwater Invertebrates',
      label: 'Freshwater Invertebrates',
      description: 'Shrimp, snails, and other inverts',
      emoji: '🦐'
    },
    {
      value: 'Saltwater Fish-Only (FO)',
      label: 'Saltwater Fish-Only',
      description: 'Marine fish without corals',
      emoji: '🐟'
    },
    {
      value: 'Fish-Only with Live Rock (FOWLR)',
      label: 'FOWLR',
      description: 'Marine fish with live rock',
      emoji: '🪨'
    },
    {
      value: 'Soft Coral Reef',
      label: 'Soft Coral Reef',
      description: 'Beginner-friendly corals',
      emoji: '🪸'
    },
    {
      value: 'Mixed Reef (LPS + Soft)',
      label: 'Mixed Reef',
      description: 'LPS and soft corals together',
      emoji: '🌊'
    },
    {
      value: 'SPS Reef (Hard Coral)',
      label: 'SPS Reef',
      description: 'Advanced coral keeping',
      emoji: '🏔️'
    }
  ];

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
    const speciesMultiplier = Math.max(1, selectedSpecies.length * 0.3);
    const recommendedSize = Math.ceil(baseSize * speciesMultiplier);
    
    return `Recommended minimum: ${recommendedSize} gallons`;
  };

  const QuizDialog = () => (
    <Dialog open={showQuiz} onOpenChange={setShowQuiz}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HelpCircle className="h-4 w-4 mr-2" />
          Help Me Choose
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tank Type Quiz</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Answer a few questions to find your ideal tank type:</p>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50" onClick={() => { handleTankTypeSelect('Freshwater'); setShowQuiz(false); }}>
              <p className="font-medium">I'm new to aquariums and want something easy</p>
              <p className="text-sm text-muted-foreground">→ Freshwater Community Tank</p>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50" onClick={() => { handleTankTypeSelect('Planted Freshwater'); setShowQuiz(false); }}>
              <p className="font-medium">I want beautiful plants and natural look</p>
              <p className="text-sm text-muted-foreground">→ Planted Freshwater Tank</p>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50" onClick={() => { handleTankTypeSelect('Saltwater Fish-Only (FO)'); setShowQuiz(false); }}>
              <p className="font-medium">I want colorful marine fish</p>
              <p className="text-sm text-muted-foreground">→ Saltwater Fish-Only Tank</p>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50" onClick={() => { handleTankTypeSelect('Soft Coral Reef'); setShowQuiz(false); }}>
              <p className="font-medium">I want corals but nothing too difficult</p>
              <p className="text-sm text-muted-foreground">→ Soft Coral Reef Tank</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">What kind of aquarium do you want to build?</h2>
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
              className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
              }`}
              onClick={() => handleTankTypeSelect(type.value)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{type.emoji}</span>
                  <CardTitle className="text-base">{type.label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{type.description}</p>
                {isSelected && (
                  <Badge className="mt-2 bg-blue-100 text-blue-800">Selected</Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {data.tankGoal && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Your Species</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SpeciesSelector
              value=""
              onChange={(species) => handleSpeciesChange(species)}
              aquariumType={data.tankGoal}
            />
            
            {selectedSpecies.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium">Selected Species:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSpecies.map(species => (
                    <Badge key={species} variant="secondary" className="cursor-pointer" onClick={() => handleSpeciesChange(species)}>
                      {species} ✕
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-blue-600 font-medium">{getRecommendedSize()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!data.tankGoal}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
