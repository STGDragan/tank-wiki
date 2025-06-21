
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WizardStepProps } from "../types";
import { ChevronLeft, Clock, AlertTriangle, ExternalLink, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function InhabitantsStep({ data, onUpdate, onNext, onPrev }: WizardStepProps) {
  const { toast } = useToast();

  const getAdditionOrder = () => {
    const isSaltwater = data.tankGoal.includes('Saltwater') || data.tankGoal.includes('Reef');
    
    if (isSaltwater) {
      return [
        {
          phase: 'Week 1-2',
          title: 'Clean-up Crew',
          description: 'Hermit crabs, snails, and other cleanup inverts',
          emoji: '🦀',
          recommendedQuantity: '3-5 pieces',
          color: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
        },
        {
          phase: 'Week 3-4',
          title: 'Hardy Fish',
          description: 'Clownfish, damsels, or other hardy species',
          emoji: '🐠',
          recommendedQuantity: '1-2 fish',
          color: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
        },
        {
          phase: 'Week 6-8',
          title: 'Sensitive Fish',
          description: 'Tangs, angels, or other delicate species',
          emoji: '🐟',
          recommendedQuantity: '1-3 fish',
          color: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700'
        },
        {
          phase: 'Month 3+',
          title: 'Corals (if applicable)',
          description: 'Soft corals first, then LPS and SPS',
          emoji: '🪸',
          recommendedQuantity: '2-4 frags',
          color: 'bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-700'
        }
      ];
    } else {
      return [
        {
          phase: 'Week 1',
          title: 'Hardy Fish',
          description: 'Tetras, barbs, or other schooling fish',
          emoji: '🐠',
          recommendedQuantity: '6-8 fish (school)',
          color: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
        },
        {
          phase: 'Week 2-3',
          title: 'Bottom Dwellers',
          description: 'Catfish, loaches, or bottom feeders',
          emoji: '🐟',
          recommendedQuantity: '2-4 fish',
          color: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
        },
        {
          phase: 'Week 4+',
          title: 'Centerpiece Fish',
          description: 'Angelfish, gouramis, or other large fish',
          emoji: '🐡',
          recommendedQuantity: '1-2 fish',
          color: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700'
        },
        {
          phase: 'Anytime',
          title: 'Invertebrates',
          description: 'Shrimp, snails, or other inverts',
          emoji: '🦐',
          recommendedQuantity: '3-6 pieces',
          color: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700'
        }
      ];
    }
  };

  const additionOrder = getAdditionOrder();

  const handleOrderSelect = () => {
    const orderNames = additionOrder.map(phase => phase.title);
    onUpdate({ inhabitantOrder: orderNames });
  };

  const handleAddToCart = (item: any) => {
    toast({
      title: "Added to Cart",
      description: `${item.title} has been added to your shopping cart.`,
    });
  };

  const handleViewArticle = (title: string) => {
    toast({
      title: "Article Coming Soon",
      description: `The article about ${title.toLowerCase()} will be available soon.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2 dark:text-slate-100">Introducing Your Inhabitants</h2>
        <p className="text-muted-foreground dark:text-slate-400">Recommended stocking timeline for your {data.tankGoal.toLowerCase()}</p>
      </div>

      <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">Important: Wait for Full Cycle</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Only add inhabitants after your tank has completed the nitrogen cycle. 
                This usually takes {data.tankGoal.includes('Saltwater') ? '4-8 weeks' : '2-6 weeks'}.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold dark:text-slate-100">Recommended Addition Order</h3>
        {additionOrder.map((phase, index) => (
          <Card key={index} className={phase.color}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{phase.emoji}</span>
                  <div>
                    <CardTitle className="text-base dark:text-slate-100">{phase.title}</CardTitle>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {phase.phase}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {phase.recommendedQuantity}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewArticle(phase.title)}
                  >
                    <BookOpen className="h-4 w-4 mr-1" />
                    Guide
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(phase)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Shop
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground dark:text-slate-300">{phase.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Quarantine Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Consider quarantining new fish for 2-4 weeks before adding them to your main tank. 
            This helps prevent disease and parasites from affecting your established inhabitants.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewArticle("Quarantine Setup")}
            className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-800/50"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Read Quarantine Guide
          </Button>
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
