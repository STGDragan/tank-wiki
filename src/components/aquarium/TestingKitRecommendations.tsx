
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TestTube2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TestingKitRecommendationsProps {
  aquariumType: string | null;
}

const testingKitRecommendations = {
  freshwater: [
    {
      name: "API Freshwater Master Test Kit",
      tests: ["pH", "Ammonia", "Nitrite", "Nitrate"],
      description: "Complete testing kit for freshwater aquariums",
      image: "https://placehold.co/200x150/3B82F6/FFFFFF?text=API+Master+Kit"
    },
    {
      name: "Seachem Ammonia Alert",
      tests: ["Ammonia"],
      description: "Continuous ammonia monitoring badge",
      image: "https://placehold.co/200x150/16A34A/FFFFFF?text=Ammonia+Alert"
    },
    {
      name: "API GH & KH Test Kit",
      tests: ["GH", "KH"],
      description: "General and carbonate hardness testing",
      image: "https://placehold.co/200x150/F59E0B/FFFFFF?text=GH+KH+Kit"
    }
  ],
  planted: [
    {
      name: "API CO2 Test Kit",
      tests: ["CO2"],
      description: "Essential for planted tank monitoring",
      image: "https://placehold.co/200x150/22C55E/FFFFFF?text=CO2+Test+Kit"
    },
    {
      name: "Seachem Iron Test Kit",
      tests: ["Iron"],
      description: "Monitor iron levels for plant nutrition",
      image: "https://placehold.co/200x150/DC2626/FFFFFF?text=Iron+Test"
    },
    {
      name: "API Phosphate Test Kit",
      tests: ["Phosphate"],
      description: "Control algae by monitoring phosphates",
      image: "https://placehold.co/200x150/7C3AED/FFFFFF?text=Phosphate+Kit"
    }
  ],
  saltwater: [
    {
      name: "Red Sea Marine Care Test Kit",
      tests: ["pH", "Ammonia", "Nitrite", "Nitrate"],
      description: "Complete marine water testing solution",
      image: "https://placehold.co/200x150/EF4444/FFFFFF?text=Marine+Care+Kit"
    },
    {
      name: "Salifert Calcium Test Kit",
      tests: ["Calcium"],
      description: "Precision calcium testing for reef tanks",
      image: "https://placehold.co/200x150/0EA5E9/FFFFFF?text=Calcium+Test"
    },
    {
      name: "Hanna Checker Alkalinity",
      tests: ["Alkalinity"],
      description: "Digital alkalinity testing device",
      image: "https://placehold.co/200x150/8B5CF6/FFFFFF?text=Hanna+Checker"
    },
    {
      name: "Red Sea Magnesium Pro Test Kit",
      tests: ["Magnesium"],
      description: "Professional magnesium testing",
      image: "https://placehold.co/200x150/F97316/FFFFFF?text=Magnesium+Kit"
    }
  ]
};

export function TestingKitRecommendations({ aquariumType }: TestingKitRecommendationsProps) {
  const isFreshwater = aquariumType === "Freshwater";
  const isPlanted = aquariumType === "Planted Freshwater";
  const isFreshwaterInverts = aquariumType === "Freshwater Invertebrates";
  const isSaltwater = aquariumType?.toLowerCase().includes('saltwater') || 
                      aquariumType?.toLowerCase().includes('reef') ||
                      aquariumType?.toLowerCase().includes('fowlr');

  let recommendations: typeof testingKitRecommendations.freshwater = [];
  let title = "";

  if (isSaltwater) {
    recommendations = testingKitRecommendations.saltwater;
    title = "Recommended Marine Testing Kits";
  } else if (isPlanted) {
    recommendations = [...testingKitRecommendations.freshwater, ...testingKitRecommendations.planted];
    title = "Recommended Planted Tank Testing Kits";
  } else if (isFreshwater || isFreshwaterInverts) {
    recommendations = testingKitRecommendations.freshwater;
    title = "Recommended Freshwater Testing Kits";
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube2 className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((kit, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <img 
                src={kit.image} 
                alt={kit.name}
                className="w-full h-32 object-cover rounded"
              />
              <div>
                <h4 className="font-semibold text-sm">{kit.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{kit.description}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {kit.tests.map((test) => (
                  <Badge key={test} variant="secondary" className="text-xs">
                    {test}
                  </Badge>
                ))}
              </div>
              <Button size="sm" variant="outline" className="w-full">
                <ExternalLink className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
