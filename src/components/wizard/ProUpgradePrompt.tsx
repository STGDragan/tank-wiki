
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Fish, Calendar, Users, Star, CheckCircle } from "lucide-react";

interface ProUpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  aquariumCount: number;
}

export function ProUpgradePrompt({ isOpen, onClose, aquariumCount }: ProUpgradePromptProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    // Redirect to Stripe checkout or subscription page
    window.location.href = '/subscription';
  };

  const proFeatures = [
    {
      icon: <Fish className="h-5 w-5 text-blue-600" />,
      title: "Unlimited Aquariums",
      description: "Track up to 10 aquariums instead of just 3"
    },
    {
      icon: <Calendar className="h-5 w-5 text-green-600" />,
      title: "Advanced Maintenance",
      description: "Smart scheduling and automated reminders"
    },
    {
      icon: <Users className="h-5 w-5 text-purple-600" />,
      title: "Tank Sharing",
      description: "Share your aquariums with family & friends"
    },
    {
      icon: <Star className="h-5 w-5 text-yellow-600" />,
      title: "Priority Support",
      description: "Get help faster with premium support"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md vibrant-card">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Upgrade to Pro
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <Fish className="h-4 w-4" />
                <span className="text-sm font-medium">
                  You've reached the limit ({aquariumCount}/3 aquariums)
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="font-semibold text-center">Unlock Pro Features:</h3>
            {proFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                {feature.icon}
                <div className="flex-1">
                  <p className="font-medium text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              </div>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 dark:from-purple-900/20 dark:to-pink-900/20 dark:border-purple-700">
            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-center gap-2">
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                  Limited Time
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                $4.99<span className="text-lg">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Cancel anytime • 7-day free trial
              </p>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button 
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full btn-pro-upgrade text-lg font-semibold py-6"
            >
              {isLoading ? "Processing..." : "Start Free Trial"}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Join thousands of aquarists who've upgraded to Pro
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
