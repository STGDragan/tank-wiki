
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WizardStepProps } from "../types";
import { ChevronLeft, Clock, AlertTriangle } from "lucide-react";

export function InhabitantsStep({ data, onUpdate, onNext, onPrev }: WizardStepProps) {
  const getAdditionOrder = () => {
    const isSaltwater = data.tankGoal.includes('Saltwater') || data.tankGoal.includes('Reef');
    
    if (isSaltwater) {
      return [
        {
          phase: 'Week 1-2',
          title: 'Clean-up Crew',
          description: 'Hermit crabs, snails, and other cleanup inverts',
          emoji: '🦀',
          color: 'bg-blue-50 border-blue-200'
        },
        {
          phase: 'Week 3-4',
          title: 'Hardy Fish',
          description: 'Clownfish, damsels, or other hardy species',
          emoji: '🐠',
          color: 'bg-green-50 border-green-200'
        },
        {
          phase: 'Week 6-8',
          title: 'Sensitive Fish',
          description: 'Tangs, angels, or other delicate species',
          emoji: '🐟',
          color: 'bg-purple-50 border-purple-200'
        },
        {
          phase: 'Month 3+',
          title: 'Corals (if applicable)',
          description: 'Soft corals first, then LPS and SPS',
          emoji: '🪸',
          color: 'bg-pink-50 border-pink-200'
        }
      ];
    } else {
      return [
        {
          phase: 'Week 1',
          title: 'Hardy Fish',
          description: 'Tetras, barbs, or other schooling fish',
          emoji: '🐠',
          color: 'bg-blue-50 border-blue-200'
        },
        {
          phase: 'Week 2-3',
          title: 'Bottom Dwellers',
          description: 'Catfish, loaches, or bottom feeders',
          emoji: '🐟',
          color: 'bg-green-50 border-green-200'
        },
        {
          phase: 'Week 4+',
          title: 'Centerpiece Fish',
          description: 'Angelfish, gouramis, or other large fish',
          emoji: '🐡',
          color: 'bg-purple-50 border-purple-200'
        },
        {
          phase: 'Anytime',
          title: 'Invertebrates',
          description: 'Shrimp, snails, or other inverts',
          emoji: '🦐',
          color: 'bg-orange-50 border-orange-200'
        }
      ];
    }
  };

  const additionOrder = getAdditionOrder();

  const handleOrderSelect = () => {
    const orderNames = additionOrder.map(phase => phase.title);
    onUpdate({ inhabitantOrder: orderNames });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Introducing Your Inhabitants</h2>
        <p className="text-muted-foreground">Recommended stocking timeline for your {data.tankGoal.toLowerCase()}</p>
      </div>

      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Important: Wait for Full Cycle</p>
              <p className="text-sm text-red-700 mt-1">
                Only add inhabitants after your tank has completed the nitrogen cycle. 
                This usually takes {data.tankGoal.includes('Saltwater') ? '4-8 weeks' : '2-6 weeks'}.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recommended Addition Order</h3>
        {additionOrder.map((phase, index) => (
          <Card key={index} className={phase.color}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{phase.emoji}</span>
                  <div>
                    <CardTitle className="text-base">{phase.title}</CardTitle>
                    <Badge variant="outline" className="text-xs mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {phase.phase}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{phase.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">Quarantine Recommendation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-700">
            Consider quarantining new fish for 2-4 weeks before adding them to your main tank. 
            This helps prevent disease and parasites from affecting your established inhabitants.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={() => { handleOrderSelect(); onNext(); }}>
          Next
        </Button>
      </div>
    </div>
  );
}
