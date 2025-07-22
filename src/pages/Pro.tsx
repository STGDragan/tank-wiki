
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
  Sparkles
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { Navigate } from "react-router-dom";

const ProPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleUpgrade = async () => {
    setIsLoading(true);
    // Redirect to Stripe checkout or subscription page
    window.location.href = '/subscription';
  };

  const proFeatures = [
    {
      icon: <Fish className="h-6 w-6 text-blue-500" />,
      title: "Unlimited Aquariums",
      description: "Track up to 10 aquariums instead of just 3",
      category: "Capacity",
      details: [
        "Manage up to 10 aquarium systems",
        "Perfect for serious hobbyists",
        "Track multiple tank types",
        "Organize by room or setup type"
      ]
    },
    {
      icon: <Calendar className="h-6 w-6 text-green-500" />,
      title: "Advanced Maintenance",
      description: "Smart scheduling and automated reminders",
      category: "Automation",
      details: [
        "Customizable maintenance templates",
        "Automated recurring task creation",
        "Email and in-app notifications",
        "Equipment-specific maintenance tracking",
        "Maintenance history analytics"
      ]
    },
    {
      icon: <Users className="h-6 w-6 text-purple-500" />,
      title: "Tank Sharing & Collaboration",
      description: "Share your aquariums with family & friends",
      category: "Social",
      details: [
        "Invite family members to view tanks",
        "Grant editing permissions to helpers",
        "Share maintenance responsibilities",
        "Collaborative aquarium management",
        "Access control and permissions"
      ]
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-orange-500" />,
      title: "Advanced Analytics",
      description: "Deep insights into your aquarium health",
      category: "Analytics",
      details: [
        "Water parameter trend analysis",
        "Maintenance cost tracking",
        "Equipment performance metrics",
        "Health score calculations",
        "Custom reporting dashboards"
      ]
    },
    {
      icon: <Cloud className="h-6 w-6 text-cyan-500" />,
      title: "Cloud Backup & Sync",
      description: "Never lose your aquarium data",
      category: "Data",
      details: [
        "Automatic cloud backups",
        "Cross-device synchronization",
        "Data export capabilities",
        "Secure encrypted storage",
        "Access from anywhere"
      ]
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      title: "Automation Tools",
      description: "Streamline your aquarium management",
      category: "Efficiency",
      details: [
        "Bulk task creation",
        "Template-based setups",
        "Smart reminder scheduling",
        "Quick-add shortcuts",
        "Batch operations"
      ]
    }
  ];

  const comparisonFeatures = [
    { feature: "Aquarium Tracking", free: "Up to 3", pro: "Up to 10" },
    { feature: "Maintenance Reminders", free: "Basic", pro: "Advanced Templates" },
    { feature: "Tank Sharing", free: "❌", pro: "✅" },
    { feature: "Advanced Analytics", free: "❌", pro: "✅" },
    { feature: "Cloud Backup", free: "❌", pro: "✅" },
    { feature: "Automation Tools", free: "❌", pro: "✅" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
              <Crown className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Upgrade to Pro
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-mono">
            Take your aquarium management to the next level with advanced features, 
            unlimited tracking, and powerful automation tools.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-4 py-2">
              Limited Time Offer
            </Badge>
            <Badge variant="outline" className="neon-border px-4 py-2">
              7-Day Free Trial
            </Badge>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="flex justify-center">
          <Card className="cyber-card w-full max-w-md">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl font-display">Pro Plan</CardTitle>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="text-lg text-muted-foreground font-mono">
                    $4.99<span className="text-sm">/month</span>
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    $49.99<span className="text-lg font-mono">/year</span>
                  </div>
                  <p className="text-sm text-green-600 font-semibold font-mono">
                    Save $9.89 with annual billing
                  </p>
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  Cancel anytime • 7-day free trial • No setup fees
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full btn-pro-upgrade text-lg font-semibold py-6"
                size="lg"
              >
                {isLoading ? "Processing..." : "Start Free Trial"}
              </Button>
              <p className="text-xs text-center text-muted-foreground font-mono">
                Join thousands of aquarists who've upgraded to Pro
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-display font-bold mb-4">Pro Features</h2>
            <p className="text-muted-foreground font-mono">Everything you need to manage your aquariums like a pro</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proFeatures.map((feature, index) => (
              <Card key={index} className="cyber-card hover:scale-105 transition-transform group">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    {feature.icon}
                    <Badge variant="outline" className="text-xs neon-border">
                      {feature.category}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold font-display text-lg">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground font-mono">
                      {feature.description}
                    </p>
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-primary uppercase tracking-wide font-mono">Features Include:</h4>
                      <ul className="space-y-1">
                        {feature.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="text-xs text-muted-foreground flex items-start gap-2 font-mono">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-display font-bold mb-4">Free vs Pro</h2>
            <p className="text-muted-foreground font-mono">See what you get with Pro</p>
          </div>
          
          <Card className="cyber-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left p-4 font-display">Feature</th>
                    <th className="text-center p-4 font-display">Free</th>
                    <th className="text-center p-4 font-display bg-gradient-to-r from-purple-600/10 to-pink-600/10">
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
                      <td className="p-4 font-mono">{item.feature}</td>
                      <td className="p-4 text-center font-mono text-muted-foreground">{item.free}</td>
                      <td className="p-4 text-center font-mono bg-gradient-to-r from-purple-600/5 to-pink-600/5">
                        <span className="text-primary font-semibold">{item.pro}</span>
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
            <h2 className="text-3xl font-display font-bold mb-4">What Pro Users Say</h2>
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
              <Card key={index} className="cyber-card">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm font-mono italic">"{testimonial.quote}"</p>
                    <div>
                      <div className="font-semibold font-mono">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-display font-bold">Ready to Go Pro?</h2>
          <p className="text-muted-foreground font-mono max-w-2xl mx-auto">
            Join thousands of aquarists who have upgraded to Pro and taken their aquarium management to the next level.
          </p>
          <Button 
            onClick={handleUpgrade}
            disabled={isLoading}
            className="btn-pro-upgrade text-lg font-semibold px-8 py-6"
            size="lg"
          >
            {isLoading ? "Processing..." : "Start Your Free Trial Now"}
          </Button>
          <p className="text-xs text-muted-foreground font-mono">
            No commitment • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProPage;
