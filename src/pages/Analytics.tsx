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
      icon: <Wrench className="h-8 w-8 text-orange-500" />,
      title: "Equipment Analytics",
      description: "Monitor equipment performance and maintenance patterns",
      examples: ["Equipment failure rates", "Maintenance frequency", "Replacement schedules"]
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
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Create custom metrics and track trends across all your aquarium data
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Metric
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custom Metrics</p>
                <p className="text-2xl font-bold">5</p>
                <p className="text-xs text-muted-foreground mt-1">User-created tracking metrics</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Records</p>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-xs text-muted-foreground mt-1">Total logged measurements</p>
              </div>
              <Database className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Aquariums</p>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground mt-1">Being tracked in analytics</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Standard Reports</p>
                <p className="text-2xl font-bold">7</p>
                <p className="text-xs text-muted-foreground mt-1">Built-in report templates</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Standard Reports Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Standard Reports</h2>
            <p className="text-muted-foreground">Pre-built reports for common aquarium analytics</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "Water Quality Trends", description: "pH, temperature, and parameter analysis", icon: <Droplets className="h-5 w-5" /> },
            { name: "Livestock Health Report", description: "Population and mortality tracking", icon: <Fish className="h-5 w-5" /> },
            { name: "Maintenance Schedule", description: "Equipment service and task completion", icon: <Wrench className="h-5 w-5" /> },
            { name: "Equipment Performance", description: "Failure rates and efficiency metrics", icon: <Target className="h-5 w-5" /> },
            { name: "Weekly Summary", description: "Overview of all aquarium activities", icon: <Calendar className="h-5 w-5" /> },
            { name: "Monthly Report", description: "Comprehensive monthly analytics", icon: <BarChart3 className="h-5 w-5" /> },
            { name: "Annual Overview", description: "Yearly trends and comparisons", icon: <TrendingUp className="h-5 w-5" /> }
          ].map((report, index) => (
            <Card key={index} className="hover:shadow-md transition-all duration-200 cursor-pointer border-primary/10 hover:border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {report.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm leading-tight">{report.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{report.description}</p>
                    <Button variant="ghost" size="sm" className="mt-2 h-6 px-2 text-xs">
                      Generate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Coming Soon Message */}
      <Card className="border-dashed border-2 border-primary/30">
        <CardContent className="p-12 text-center">
          <BarChart3 className="h-16 w-16 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Analytics Dashboard Coming Soon</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're building powerful analytics tools that will let you create custom metrics 
            from any data field, track trends over time, and generate professional reports. 
            This feature will be available in the next update!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;