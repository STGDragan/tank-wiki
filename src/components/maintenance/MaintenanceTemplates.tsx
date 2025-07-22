import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, DollarSign, Wrench, Plus, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface MaintenanceTemplatesProps {
  aquariumId: string;
  userId: string;
}

interface Template {
  id: string;
  equipment_type: string;
  template_name: string;
  task_description: string;
  frequency_days: number;
  estimated_cost: number;
  priority: string;
  instructions: string;
  required_supplies: any;
}

export function MaintenanceTemplates({ aquariumId, userId }: MaintenanceTemplatesProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [equipment, setEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [aquariumId]);

  const loadData = async () => {
    try {
      // Load templates
      const { data: templatesData } = await supabase
        .from('maintenance_templates')
        .select('*')
        .eq('is_active', true)
        .order('equipment_type', { ascending: true });

      // Load user's equipment
      const { data: equipmentData } = await supabase
        .from('equipment')
        .select('*')
        .eq('aquarium_id', aquariumId)
        .eq('user_id', userId);

      setTemplates(templatesData || []);
      setEquipment(equipmentData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTask = async (template: Template, equipmentId: string) => {
    try {
      const { data, error } = await supabase.rpc('generate_maintenance_from_template', {
        p_equipment_id: equipmentId,
        p_template_id: template.id,
        p_user_id: userId,
        p_aquarium_id: aquariumId
      });

      if (error) throw error;

      toast({
        title: "Maintenance Task Created",
        description: `Generated "${template.template_name}" from template`,
      });
    } catch (error) {
      console.error('Error generating task:', error);
      toast({
        title: "Error",
        description: "Failed to generate maintenance task",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getFrequencyText = (days: number) => {
    if (days <= 7) return 'Weekly';
    if (days <= 31) return 'Monthly';
    if (days <= 93) return 'Quarterly';
    if (days <= 186) return 'Bi-annually';
    return 'Annually';
  };

  // Group templates by equipment type
  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.equipment_type]) {
      acc[template.equipment_type] = [];
    }
    acc[template.equipment_type].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  if (loading) {
    return <div className="p-4">Loading templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Maintenance Templates</h3>
          <p className="text-sm text-muted-foreground">
            Pre-configured maintenance schedules for different equipment types
          </p>
        </div>
      </div>

      {Object.entries(groupedTemplates).map(([equipmentType, typeTemplates]) => (
        <Card key={equipmentType}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              {equipmentType}
            </CardTitle>
            <CardDescription>
              {typeTemplates.length} template{typeTemplates.length !== 1 ? 's' : ''} available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {typeTemplates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{template.template_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {template.task_description}
                      </p>
                    </div>
                    <Badge variant={getPriorityColor(template.priority)}>
                      {template.priority}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{getFrequencyText(template.frequency_days)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Every {template.frequency_days} days</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>${template.estimated_cost.toFixed(2)}</span>
                    </div>
                  </div>

                  {template.required_supplies && template.required_supplies.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Required Supplies:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.required_supplies.map((supply, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {supply}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Generate Task from Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Generate Maintenance Task</DialogTitle>
                        <DialogDescription>
                          Select equipment to create a maintenance task from this template
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Select Equipment</label>
                          <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose equipment..." />
                            </SelectTrigger>
                            <SelectContent>
                              {equipment
                                .filter((eq: any) => eq.type === equipmentType)
                                .map((eq: any) => (
                                  <SelectItem key={eq.id} value={eq.id}>
                                    {eq.brand} {eq.model} ({eq.type})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="bg-muted p-3 rounded-lg space-y-2">
                          <h4 className="font-medium">{template.template_name}</h4>
                          <p className="text-sm text-muted-foreground">{template.instructions}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span>Due: {getFrequencyText(template.frequency_days)}</span>
                            <span>Cost: ${template.estimated_cost.toFixed(2)}</span>
                            <Badge variant={getPriorityColor(template.priority)}>
                              {template.priority}
                            </Badge>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleGenerateTask(template, selectedEquipment)}
                          disabled={!selectedEquipment}
                          className="w-full"
                        >
                          Create Maintenance Task
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {Object.keys(groupedTemplates).length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Templates Available</h3>
            <p className="text-muted-foreground">
              Add some equipment to your aquarium to see relevant maintenance templates
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}