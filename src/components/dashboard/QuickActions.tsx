
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
      color: "text-blue-400 bg-blue-900/30 hover:bg-blue-800/40 border-blue-700/50"
    },
    {
      title: "Log Parameters",
      description: "Record water tests",
      icon: TestTube,
      action: () => navigate("/dashboard"),
      color: "text-green-400 bg-green-900/30 hover:bg-green-800/40 border-green-700/50"
    },
    {
      title: "Schedule Maintenance",
      description: "Plan tank care",
      icon: Calendar,
      action: () => navigate("/dashboard"),
      color: "text-cyan-400 bg-cyan-900/30 hover:bg-cyan-800/40 border-cyan-700/50"
    },
    {
      title: "Add Equipment",
      description: "Track new gear",
      icon: Wrench,
      action: () => navigate("/dashboard"),
      color: "text-purple-400 bg-purple-900/30 hover:bg-purple-800/40 border-purple-700/50"
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
              <div className="text-xs opacity-75">{action.description}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};
