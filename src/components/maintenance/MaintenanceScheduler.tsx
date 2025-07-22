import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Bot, Zap, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface MaintenanceSchedulerProps {
  aquariumId: string;
  userId: string;
}

export function MaintenanceScheduler({ aquariumId, userId }: MaintenanceSchedulerProps) {
  const [equipment, setEquipment] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [aquariumId, userId]);

  const loadData = async () => {
    try {
      // Load equipment
      const { data: equipmentData } = await supabase
        .from('equipment')
        .select('*')
        .eq('aquarium_id', aquariumId)
        .eq('user_id', userId);

      // Load maintenance templates
      const { data: templatesData } = await supabase
        .from('maintenance_templates')
        .select('*')
        .eq('is_active', true);

      // Load existing maintenance tasks
      const { data: tasksData } = await supabase
        .from('maintenance')
        .select('*')
        .eq('aquarium_id', aquariumId)
        .eq('user_id', userId);

      setEquipment(equipmentData || []);
      
      // Generate smart suggestions
      const smartSuggestions = generateSmartSuggestions(
        equipmentData || [], 
        templatesData || [], 
        tasksData || []
      );
      setSuggestions(smartSuggestions);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSmartSuggestions = (equipment: any[], templates: any[], existingTasks: any[]) => {
    const suggestions = [];

    equipment.forEach(eq => {
      const relevantTemplates = templates.filter(t => t.equipment_type === eq.type);
      
      relevantTemplates.forEach(template => {
        // Check if there's already a task for this equipment+template
        const existingTask = existingTasks.find(task => 
          task.equipment_id === eq.id && 
          task.template_id === template.id &&
          !task.completed_date
        );

        if (!existingTask) {
          // Calculate urgency based on equipment age and last maintenance
          const equipmentAge = eq.installed_at ? 
            Math.floor((Date.now() - new Date(eq.installed_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;
          
          const lastTaskForEquipment = existingTasks
            .filter(task => task.equipment_id === eq.id && task.completed_date)
            .sort((a, b) => new Date(b.completed_date).getTime() - new Date(a.completed_date).getTime())[0];

          const daysSinceLastMaintenance = lastTaskForEquipment ?
            Math.floor((Date.now() - new Date(lastTaskForEquipment.completed_date).getTime()) / (1000 * 60 * 60 * 24)) : 
            equipmentAge;

          const urgency = daysSinceLastMaintenance > template.frequency_days ? 'overdue' :
                         daysSinceLastMaintenance > (template.frequency_days * 0.8) ? 'due_soon' : 'scheduled';

          suggestions.push({
            id: `${eq.id}-${template.id}`,
            equipment: eq,
            template: template,
            urgency: urgency,
            daysSinceLastMaintenance,
            recommendedDate: new Date(Date.now() + (template.frequency_days - daysSinceLastMaintenance) * 24 * 60 * 60 * 1000)
          });
        }
      });
    });

    // Sort by urgency
    return suggestions.sort((a, b) => {
      const urgencyOrder = { 'overdue': 0, 'due_soon': 1, 'scheduled': 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
  };

  const handleAcceptSuggestion = async (suggestion: any) => {
    try {
      const { data, error } = await supabase.rpc('generate_maintenance_from_template', {
        p_equipment_id: suggestion.equipment.id,
        p_template_id: suggestion.template.id,
        p_user_id: userId,
        p_aquarium_id: aquariumId
      });

      if (error) throw error;

      toast({
        title: "Task Scheduled",
        description: `${suggestion.template.template_name} has been scheduled`,
      });

      loadData(); // Refresh suggestions
    } catch (error) {
      console.error('Error accepting suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to schedule maintenance task",
        variant: "destructive",
      });
    }
  };

  const handleBulkSchedule = async () => {
    try {
      const criticalSuggestions = suggestions.filter(s => s.urgency === 'overdue');
      
      for (const suggestion of criticalSuggestions) {
        await supabase.rpc('generate_maintenance_from_template', {
          p_equipment_id: suggestion.equipment.id,
          p_template_id: suggestion.template.id,
          p_user_id: userId,
          p_aquarium_id: aquariumId
        });
      }

      toast({
        title: "Bulk Scheduling Complete",
        description: `Scheduled ${criticalSuggestions.length} critical maintenance tasks`,
      });

      loadData();
    } catch (error) {
      console.error('Error bulk scheduling:', error);
      toast({
        title: "Error",
        description: "Failed to bulk schedule tasks",
        variant: "destructive",
      });
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'overdue': return 'destructive';
      case 'due_soon': return 'default';
      case 'scheduled': return 'secondary';
      default: return 'secondary';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      case 'due_soon': return <Clock className="h-4 w-4" />;
      case 'scheduled': return <Calendar className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div className="p-4">Loading smart suggestions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            Smart Maintenance Scheduler
          </h3>
          <p className="text-sm text-muted-foreground">
            AI-powered suggestions based on your equipment and maintenance history
          </p>
        </div>
        {suggestions.filter(s => s.urgency === 'overdue').length > 0 && (
          <Button onClick={handleBulkSchedule} variant="default">
            <Zap className="h-4 w-4 mr-2" />
            Schedule All Critical
          </Button>
        )}
      </div>

      {/* Suggestions */}
      <div className="space-y-4">
        {suggestions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">
                No maintenance suggestions at this time. Your equipment is well maintained.
              </p>
            </CardContent>
          </Card>
        ) : (
          suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {getUrgencyIcon(suggestion.urgency)}
                      {suggestion.template.template_name}
                    </CardTitle>
                    <CardDescription>
                      {suggestion.equipment.brand} {suggestion.equipment.model} ({suggestion.equipment.type})
                    </CardDescription>
                  </div>
                  <Badge variant={getUrgencyColor(suggestion.urgency)}>
                    {suggestion.urgency.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {suggestion.template.task_description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span>
                        <strong>Last maintenance:</strong> {suggestion.daysSinceLastMaintenance} days ago
                      </span>
                      <span>
                        <strong>Frequency:</strong> Every {suggestion.template.frequency_days} days
                      </span>
                      <span>
                        <strong>Cost:</strong> ${suggestion.template.estimated_cost.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {suggestion.urgency !== 'overdue' && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Recommended date:</strong> {suggestion.recommendedDate.toLocaleDateString()}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => handleAcceptSuggestion(suggestion)}
                      size="sm"
                      variant={suggestion.urgency === 'overdue' ? 'default' : 'outline'}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Task
                    </Button>
                    
                    {suggestion.template.instructions && (
                      <div className="text-xs text-muted-foreground bg-muted p-2 rounded flex-1">
                        <strong>Instructions:</strong> {suggestion.template.instructions}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Equipment Without Templates */}
      {equipment.filter((eq: any) => 
        !suggestions.some(s => s.equipment.id === eq.id)
      ).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Equipment Without Maintenance Templates</CardTitle>
            <CardDescription>
              These equipment types don't have predefined maintenance templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {equipment
                .filter((eq: any) => !suggestions.some(s => s.equipment.id === eq.id))
                .map((eq: any) => (
                  <div key={eq.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">
                      {eq.brand} {eq.model} ({eq.type})
                    </span>
                    <Badge variant="outline">No templates</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}