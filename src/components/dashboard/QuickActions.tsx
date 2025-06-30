
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
      color: "text-blue-100 bg-blue-600/40 hover:bg-blue-600/60 border-blue-400/60"
    },
    {
      title: "Log Parameters",
      description: "Record water tests",
      icon: TestTube,
      action: () => navigate("/dashboard"),
      color: "text-green-100 bg-green-600/40 hover:bg-green-600/60 border-green-400/60"
    },
    {
      title: "Schedule Maintenance",
      description: "Plan tank care",
      icon: Calendar,
      action: () => navigate("/dashboard"),
      color: "text-cyan-100 bg-cyan-600/40 hover:bg-cyan-600/60 border-cyan-400/60"
    },
    {
      title: "Add Equipment",
      description: "Track new gear",
      icon: Wrench,
      action: () => navigate("/dashboard"),
      color: "text-purple-100 bg-purple-600/40 hover:bg-purple-600/60 border-purple-400/60"
    }
  ];

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-display font-bold text-cyan-400">Quick Actions</h3>
      </div>
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
              <div className="text-xs opacity-90">{action.description}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};
