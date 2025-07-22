import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Database, 
  Plus,
  Fish,
  Wrench,
  Droplets,
  DollarSign,
  Target,
  Clock
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { ProUpgradePrompt } from "@/components/wizard/ProUpgradePrompt";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { ReportGenerator } from "@/components/analytics/ReportGenerator";

const Analytics = () => {
  const { hasActiveSubscription } = useAuth();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(!hasActiveSubscription);

  const analyticsFeatures = [
    {
      icon: <Fish className="h-8 w-8 text-blue-500" />,
      title: "Livestock Analytics",
      description: "Track livestock counts, health trends, and mortality rates over time",
      examples: ["Total inhabitants over time", "Species diversity analysis", "Growth tracking"]
    },
    {
      icon: <Droplets className="h-8 w-8 text-cyan-500" />,
      title: "Water Parameter Trends",
      description: "Analyze water quality patterns and parameter stability",
      examples: ["pH stability analysis", "Temperature fluctuations", "Parameter correlation"]
    },
    {
      icon: <Target className="h-8 w-8 text-purple-500" />,
      title: "Custom Metrics",
      description: "Create your own analytics from any data field",
      examples: ["Custom KPIs", "Personalized dashboards", "Goal tracking"]
    },
    {
      icon: <Clock className="h-8 w-8 text-red-500" />,
      title: "Time-based Reports",
      description: "Generate scheduled reports and trend analysis",
      examples: ["Weekly summaries", "Monthly reports", "Yearly comparisons"]
    }
  ];

  if (!hasActiveSubscription) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
          <div className="container mx-auto px-4 py-12 space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                  <BarChart3 className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Advanced Analytics
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Unlock powerful insights into your aquarium data with custom metrics, 
                trend analysis, and professional reporting tools.
              </p>
              
              <div className="flex items-center justify-center gap-4">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-2">
                  Pro Feature
                </Badge>
                <Badge variant="outline" className="px-4 py-2 border-primary/50">
                  Custom Dashboards
                </Badge>
              </div>
            </div>

            {/* Features Grid */}
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Analytics Features</h2>
                <p className="text-muted-foreground">Create custom metrics from any data you track</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analyticsFeatures.map((feature, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-200 hover:scale-105 border-primary/10">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        {feature.icon}
                        <Badge variant="outline" className="text-xs border-primary/30">
                          Pro
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                        <div className="space-y-2">
                          <h4 className="text-xs font-medium text-primary uppercase tracking-wide">Examples:</h4>
                          <ul className="space-y-1">
                            {feature.examples.map((example, exampleIndex) => (
                              <li key={exampleIndex} className="text-xs text-muted-foreground flex items-start gap-2">
                                <TrendingUp className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                {example}
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

            {/* CTA Section */}
            <div className="text-center space-y-6">
              <Card className="max-w-2xl mx-auto border-primary/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Ready to Unlock Analytics?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Upgrade to Pro to access powerful analytics, custom metrics, 
                    and professional reporting tools for your aquariums.
                  </p>
                  <Button 
                    onClick={() => setShowUpgradePrompt(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg font-semibold px-8 py-6"
                    size="lg"
                  >
                    Upgrade to Pro
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <ProUpgradePrompt 
          isOpen={showUpgradePrompt}
          onClose={() => setShowUpgradePrompt(false)}
          aquariumCount={0}
        />
      </>
    );
  }

  // Pro User Analytics Dashboard
  return (
    <div className="space-y-8">
      <AnalyticsDashboard />
      <ReportGenerator />
    </div>
  );
};

export default Analytics;