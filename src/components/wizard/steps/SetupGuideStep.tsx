
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { WizardStepProps } from "../types";
import { ChevronLeft, Clock, Bell, BookOpen, CheckCircle } from "lucide-react";

export function SetupGuideStep({ data, onUpdate, onNext, onPrev }: WizardStepProps) {
  const [completedArticles, setCompletedArticles] = useState<string[]>([]);

  const setupSteps = [
    {
      id: 'tank_placed',
      step: 1,
      title: 'Tank placed in ideal location',
      description: 'Clean the area and place your tank stand',
      emoji: '🧹',
      article: 'Tank Placement Guide'
    },
    {
      id: 'equipment_installed',
      step: 2,
      title: 'Equipment installed',
      description: 'Set up filter, heater, and other equipment',
      emoji: '🔧',
      article: 'Equipment Installation'
    },
    {
      id: 'substrate_added',
      step: 3,
      title: 'Substrate added',
      description: 'Rinse and add gravel, sand, or soil',
      emoji: '🪨',
      article: 'Substrate Selection Guide'
    },
    {
      id: 'decorations_added',
      step: 4,
      title: 'Decorations and hardscape added',
      description: 'Place rocks, driftwood, and decorations',
      emoji: '🏺',
      article: 'Aquascaping Basics'
    },
    {
      id: 'water_added',
      step: 5,
      title: 'Water added and conditioned',
      description: 'Add dechlorinated water slowly',
      emoji: '💧',
      article: 'Water Preparation'
    },
    {
      id: 'cycle_started',
      step: 6,
      title: 'Cycle started',
      description: 'Turn on filter, heater, and lights',
      emoji: '⚡',
      article: 'Initial Startup'
    },
    {
      id: 'cycle_completed',
      step: 7,
      title: 'Tank fully cycled',
      description: 'Start the nitrogen cycle process',
      emoji: '🔄',
      article: 'Nitrogen Cycle Guide'
    }
  ];

  const cyclingInfo = {
    freshwater: {
      duration: '2-6 weeks',
      method: 'Add ammonia source and beneficial bacteria',
      testing: 'Test ammonia, nitrite, and nitrate daily'
    },
    saltwater: {
      duration: '4-8 weeks',
      method: 'Add live rock or bacteria starter',
      testing: 'Test ammonia, nitrite, nitrate, and salinity'
    }
  };

  const managementArticles = [
    { title: 'Daily Tank Maintenance', category: 'Maintenance' },
    { title: 'Water Testing Schedule', category: 'Testing' },
    { title: 'Equipment Troubleshooting', category: 'Equipment' },
    { title: 'Fish Health Monitoring', category: 'Health' },
    { title: 'Algae Prevention', category: 'Maintenance' }
  ];

  const isSaltwater = data.tankGoal.includes('Saltwater') || data.tankGoal.includes('Reef');
  const cycleInfo = isSaltwater ? cyclingInfo.saltwater : cyclingInfo.freshwater;

  const handleStepComplete = (stepId: string, checked: boolean) => {
    const currentSteps = data.completedSetupSteps || [];
    if (checked) {
      onUpdate({ completedSetupSteps: [...currentSteps, stepId] });
    } else {
      onUpdate({ completedSetupSteps: currentSteps.filter(step => step !== stepId) });
    }
  };

  const handleArticleComplete = (articleTitle: string, checked: boolean) => {
    if (checked) {
      setCompletedArticles([...completedArticles, articleTitle]);
    } else {
      setCompletedArticles(completedArticles.filter(article => article !== articleTitle));
    }
  };

  const handleReminderToggle = (wantsReminders: boolean) => {
    onUpdate({ wantsCycleReminders: wantsReminders });
  };

  const handleViewArticle = (title: string) => {
    // This will eventually navigate to the article
    console.log(`Viewing article: ${title}`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2 dark:text-slate-100">Setup Guide & Cycling Plan</h2>
        <p className="text-muted-foreground dark:text-slate-400">Step-by-step instructions for your {data.tankGoal.toLowerCase()}</p>
      </div>

      <Card className="dark:bg-slate-800/50 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg dark:text-slate-100 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Setup Progress ({(data.completedSetupSteps || []).length}/{setupSteps.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {setupSteps.map((step) => (
              <div key={step.step} className="flex items-center gap-3 p-3 border rounded-lg dark:border-slate-600">
                <Checkbox
                  checked={(data.completedSetupSteps || []).includes(step.id)}
                  onCheckedChange={(checked) => handleStepComplete(step.id, checked as boolean)}
                />
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {step.step}
                </div>
                <span className="text-2xl">{step.emoji}</span>
                <div className="flex-1">
                  <p className="font-medium dark:text-slate-200">{step.title}</p>
                  <p className="text-sm text-muted-foreground dark:text-slate-400">{step.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewArticle(step.article)}
                  className="dark:border-slate-600"
                >
                  <BookOpen className="h-4 w-4 mr-1" />
                  Guide
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-lg text-amber-800 dark:text-amber-200">Tank Cycling Process</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-lg">
            <p className="text-amber-800 dark:text-amber-200 font-medium mb-2">What is the Nitrogen Cycle?</p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              The nitrogen cycle is the biological process that converts toxic ammonia (from fish waste and uneaten food) 
              into less harmful nitrates through beneficial bacteria. This process is essential for a healthy aquarium ecosystem.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">Duration</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">{cycleInfo.duration}</p>
            </div>
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">Method</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">{cycleInfo.method}</p>
            </div>
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">Testing</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">{cycleInfo.testing}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t border-amber-200 dark:border-amber-700">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={data.wantsCycleReminders}
                onCheckedChange={handleReminderToggle}
              />
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="font-medium text-amber-800 dark:text-amber-200">Send me daily reminders to track my cycle</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewArticle("Complete Nitrogen Cycle Guide")}
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-800/50"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Full Guide
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-slate-800/50 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Recommended Reading ({completedArticles.length}/{managementArticles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {managementArticles.map((article) => (
              <div key={article.title} className="flex items-center justify-between p-3 border rounded-lg dark:border-slate-600">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={completedArticles.includes(article.title)}
                    onCheckedChange={(checked) => handleArticleComplete(article.title, checked as boolean)}
                  />
                  <div>
                    <p className="font-medium dark:text-slate-200">{article.title}</p>
                    <Badge variant="secondary" className="text-xs">{article.category}</Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewArticle(article.title)}
                  className="dark:border-slate-600"
                >
                  <BookOpen className="h-4 w-4 mr-1" />
                  Read
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {data.experienceLevel === 'beginner' && (
        <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">Beginner Tip</p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Don't skip the cycling process! It's the most important step for a healthy aquarium. 
                  Be patient - rushing this step is the #1 cause of fish loss in new tanks.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
