
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Fish, Calendar, Users, Star, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProUpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  aquariumCount: number;
}

export function ProUpgradePrompt({ isOpen, onClose, aquariumCount }: ProUpgradePromptProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    setIsLoading(true);
    onClose();
    navigate('/pro');
  };

  const handlePurchase = async () => {
    setIsLoading(true);
    onClose();
    navigate('/upgrade');
  };

  const handleLearnMore = () => {
    onClose();
    navigate('/pro');
  };

  const proFeatures = [
    {
      icon: <Fish className="h-5 w-5 text-blue-600" />,
      title: "Up to 10 Aquariums",
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
      <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 border-slate-700 text-white">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white">
            Upgrade to Pro
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="bg-red-500/20 border-red-400/30 backdrop-blur-sm">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-red-200">
                <Fish className="h-4 w-4" />
                <span className="text-sm font-medium">
                  You've reached the limit ({aquariumCount}/3 aquariums)
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="font-semibold text-center text-white">Unlock Pro Features:</h3>
            {proFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                {feature.icon}
                <div className="flex-1">
                  <p className="font-medium text-sm text-white">{feature.title}</p>
                  <p className="text-xs text-white/80">{feature.description}</p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
              </div>
            ))}
          </div>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-center gap-2">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                  Limited Time
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <div className="space-y-1">
                <div className="text-lg text-white/80">
                  $4.99<span className="text-sm">/month</span>
                </div>
                <div className="text-3xl font-bold text-white">
                  $49.99<span className="text-lg">/year</span>
                </div>
                <p className="text-sm text-green-300 font-medium">
                  Save $9.89 with annual billing
                </p>
              </div>
              <p className="text-sm text-white/80">
                Cancel anytime • 7-day free trial
              </p>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button 
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg font-semibold py-6 border-0"
            >
              {isLoading ? "Loading..." : "Start Free Trial"}
            </Button>
            <Button 
              onClick={handlePurchase}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-4 border-0"
            >
              {isLoading ? "Loading..." : "Purchase Now"}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLearnMore}
              className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              Learn More About Pro
            </Button>
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="w-full text-xs text-white/70 hover:text-white hover:bg-white/10"
            >
              Maybe Later
            </Button>
          </div>

          <p className="text-xs text-center text-white/70">
            Join thousands of aquarists who've upgraded to Pro
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
