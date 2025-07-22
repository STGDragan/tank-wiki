import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Crown, Star, Settings, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface DefaultMaintenanceSetupProps {
  aquariumId: string;
  userId: string;
  hasActiveSubscription: boolean;
  onSetupComplete: () => void;
}

export function DefaultMaintenanceSetup({ 
  aquariumId, 
  userId, 
  hasActiveSubscription, 
  onSetupComplete 
}: DefaultMaintenanceSetupProps) {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleSetupDefaults = async () => {
    if (!hasActiveSubscription) {
      toast({
        title: "Pro Subscription Required",
        description: "Default maintenance schedules are available for Pro users only.",
        variant: "destructive",
      });
      return;
    }

    setIsSettingUp(true);
    
    try {
      const { error } = await supabase.rpc('setup_default_maintenance_schedule', {
        p_user_id: userId,
        p_aquarium_id: aquariumId
      });

      if (error) throw error;

      setIsComplete(true);
      toast({
        title: "Default Schedule Created!",
        description: "Your aquarium now has a complete maintenance schedule. You can modify any task as needed.",
      });

      // Call the callback to refresh the maintenance data
      onSetupComplete();
    } catch (error) {
      console.error('Error setting up default schedule:', error);
      toast({
        title: "Setup Failed",
        description: "Failed to create default maintenance schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSettingUp(false);
    }
  };

  if (!hasActiveSubscription) {
    return null;
  }

  if (isComplete) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CardContent className="flex items-center gap-3 pt-6">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <div>
            <p className="font-medium text-green-900 dark:text-green-100">
              Default maintenance schedule is now active!
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              All common maintenance tasks have been scheduled. You can modify them as needed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gradient-to-r from-blue-400/20 to-blue-600/20 bg-gradient-to-r from-blue-50/50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Crown className="h-5 w-5 text-blue-600" />
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            <Star className="h-3 w-3 mr-1" />
            Pro Feature
          </Badge>
        </div>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Set Up Default Maintenance Schedule
        </CardTitle>
        <CardDescription>
          Get started with a complete maintenance schedule including all essential aquarium care tasks.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Included tasks:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Weekly water changes (20-25%)</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Weekly glass cleaning</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Bi-weekly substrate vacuuming</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Filter media inspection</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Water parameter testing</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Monthly equipment checks</span>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Fully customizable:</strong> All tasks can be modified after setup. 
            Adjust frequencies, volumes, and notes to match your specific aquarium needs.
          </p>
        </div>

        <Button 
          onClick={handleSetupDefaults}
          disabled={isSettingUp}
          className="w-full"
        >
          <Calendar className="h-4 w-4 mr-2" />
          {isSettingUp ? "Setting up..." : "Create Default Schedule"}
        </Button>
      </CardContent>
    </Card>
  );
}