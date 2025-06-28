
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TestTube, Wrench, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActions = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Add Aquarium",
      description: "Create a new tank",
      icon: Plus,
      action: () => navigate("/aquariums/new"),
      color: "text-blue-600"
    },
    {
      title: "Log Parameters",
      description: "Record water tests",
      icon: TestTube,
      action: () => navigate("/dashboard"),
      color: "text-green-600"
    },
    {
      title: "Schedule Maintenance",
      description: "Plan tank care",
      icon: Calendar,
      action: () => navigate("/dashboard"),
      color: "text-orange-600"
    },
    {
      title: "Add Equipment",
      description: "Track new gear",
      icon: Wrench,
      action: () => navigate("/dashboard"),
      color: "text-purple-600"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start h-auto p-3"
              onClick={action.action}
            >
              <action.icon className={`h-4 w-4 mr-3 ${action.color}`} />
              <div className="text-left">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
