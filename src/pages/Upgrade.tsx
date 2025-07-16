
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Fish, 
  Calendar, 
  Users, 
  Star, 
  CheckCircle, 
  Zap,
  Shield,
  HeadphonesIcon,
  TrendingUp,
  BarChart3,
  Cloud,
  Sparkles,
  ArrowRight,
  X
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const UpgradePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast({
        title: "Error",
        description: "Failed to start upgrade process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const proFeatures = [
    {
      icon: <Fish className="h-6 w-6 text-blue-500" />,
      title: "Unlimited Aquariums",
      description: "Track unlimited aquariums instead of just 3",
      category: "Capacity"
    },
    {
      icon: <Calendar className="h-6 w-6 text-green-500" />,
      title: "Advanced Maintenance",
      description: "Smart scheduling, automated reminders, and maintenance templates",
      category: "Automation"
    },
    {
      icon: <Users className="h-6 w-6 text-purple-500" />,
      title: "Tank Sharing & Collaboration",
      description: "Share your aquariums with family, friends, and fellow aquarists",
      category: "Social"
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-orange-500" />,
      title: "Advanced Analytics",
      description: "Detailed insights, trends, and health reports for your aquariums",
      category: "Analytics"
    },
    {
      icon: <Cloud className="h-6 w-6 text-cyan-500" />,
      title: "Cloud Backup & Sync",
      description: "Never lose your data with automatic cloud backups",
      category: "Backup"
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      title: "Priority Product Recommendations",
      description: "Get the best equipment suggestions based on your setup",
      category: "Shopping"
    },
    {
      icon: <HeadphonesIcon className="h-6 w-6 text-pink-500" />,
      title: "Priority Support",
      description: "Get help faster with premium email and chat support",
      category: "Support"
    },
    {
      icon: <Sparkles className="h-6 w-6 text-indigo-500" />,
      title: "Early Access Features",
      description: "Be the first to try new features and beta releases",
      category: "Exclusive"
    }
  ];

  const comparisonFeatures = [
    { feature: "Aquarium Tracking", free: "Up to 3", pro: "Unlimited" },
    { feature: "Maintenance Reminders", free: "Basic", pro: "Advanced + Templates" },
    { feature: "Tank Sharing", free: <X className="h-4 w-4 text-red-500" />, pro: <CheckCircle className="h-4 w-4 text-green-500" /> },
    { feature: "Analytics & Reports", free: "Basic", pro: "Advanced" },
    { feature: "Cloud Backup", free: <X className="h-4 w-4 text-red-500" />, pro: <CheckCircle className="h-4 w-4 text-green-500" /> },
    { feature: "Priority Support", free: <X className="h-4 w-4 text-red-500" />, pro: <CheckCircle className="h-4 w-4 text-green-500" /> },
    { feature: "Early Access", free: <X className="h-4 w-4 text-red-500" />, pro: <CheckCircle className="h-4 w-4 text-green-500" /> },
    { feature: "Ad-Free Experience", free: <X className="h-4 w-4 text-red-500" />, pro: <CheckCircle className="h-4 w-4 text-green-500" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
              <Crown className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Upgrade to Pro
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Take your aquarium management to the next level with advanced features, 
            unlimited tracking, and priority support.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 px-4 py-2">
              Limited Time Offer
            </Badge>
            <Badge variant="outline" className="px-4 py-2 border-primary/50">
              7-Day Free Trial
            </Badge>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md border-primary/20 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">Pro Plan</CardTitle>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="text-lg text-muted-foreground">
                    $4.99<span className="text-sm">/month</span>
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    $49.99<span className="text-lg">/year</span>
                  </div>
                  <p className="text-sm text-green-600 font-semibold">
                    Save $9.89 with annual billing
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Cancel anytime • 7-day free trial • No setup fees
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg font-semibold py-6"
                size="lg"
              >
                {isLoading ? "Processing..." : (
                  <>
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Join thousands of aquarists who've upgraded to Pro
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Pro Features</h2>
            <p className="text-muted-foreground">Everything you need to manage your aquariums like a pro</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {proFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-200 hover:scale-105 border-primary/10">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    {feature.icon}
                    <Badge variant="outline" className="text-xs border-primary/30">
                      {feature.category}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Free vs Pro</h2>
            <p className="text-muted-foreground">See what you get with Pro</p>
          </div>
          
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left p-4">Feature</th>
                    <th className="text-center p-4">Free</th>
                    <th className="text-center p-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10">
                      <div className="flex items-center justify-center gap-2">
                        <Crown className="h-4 w-4" />
                        Pro
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((item, index) => (
                    <tr key={index} className="border-b border-border/20">
                      <td className="p-4">{item.feature}</td>
                      <td className="p-4 text-center text-muted-foreground">
                        {typeof item.free === 'string' ? item.free : item.free}
                      </td>
                      <td className="p-4 text-center bg-gradient-to-r from-purple-600/5 to-blue-600/5">
                        <span className="text-primary font-semibold">
                          {typeof item.pro === 'string' ? item.pro : item.pro}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Testimonials */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">What Pro Users Say</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah M.",
                role: "Marine Aquarist",
                quote: "The advanced analytics helped me identify water parameter trends I never noticed before. My corals have never looked better!"
              },
              {
                name: "Mike R.",
                role: "Fish Breeder",
                quote: "Being able to share my breeding tanks with my partner and track everything together has been a game-changer."
              },
              {
                name: "Jessica L.",
                role: "Aquarium Enthusiast",
                quote: "The automated maintenance reminders and templates save me hours every week. Worth every penny!"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-primary/10">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm italic">"{testimonial.quote}"</p>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Go Pro?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of aquarists who have upgraded to Pro and taken their aquarium management to the next level.
          </p>
          <Button 
            onClick={handleUpgrade}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg font-semibold px-8 py-6"
            size="lg"
          >
            {isLoading ? "Processing..." : (
              <>
                Start Your Free Trial Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            No commitment • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;
