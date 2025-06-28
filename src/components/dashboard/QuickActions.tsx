
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
      color: "text-blue-600 bg-blue-50 hover:bg-blue-100"
    },
    {
      title: "Log Parameters",
      description: "Record water tests",
      icon: TestTube,
      action: () => navigate("/dashboard"),
      color: "text-green-600 bg-green-50 hover:bg-green-100"
    },
    {
      title: "Schedule Maintenance",
      description: "Plan tank care",
      icon: Calendar,
      action: () => navigate("/dashboard"),
      color: "text-orange-600 bg-orange-50 hover:bg-orange-100"
    },
    {
      title: "Add Equipment",
      description: "Track new gear",
      icon: Wrench,
      action: () => navigate("/dashboard"),
      color: "text-purple-600 bg-purple-50 hover:bg-purple-100"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className={`h-24 flex flex-col items-center justify-center gap-2 ${action.color} border-2 transition-all duration-200`}
              onClick={action.action}
            >
              <action.icon className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs opacity-75">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
