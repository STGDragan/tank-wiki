import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Calendar, Settings, TrendingUp, Wrench, DollarSign, Bell, Users, Clock } from "lucide-react";
import { MaintenanceTemplates } from "./MaintenanceTemplates";
import { MaintenanceAnalytics } from "./MaintenanceAnalytics";
import { MaintenanceCostTracker } from "./MaintenanceCostTracker";
import { MaintenanceScheduler } from "./MaintenanceScheduler";
import { NotificationPreferences } from "./NotificationPreferences";
import { EquipmentWarranties } from "./EquipmentWarranties";
import { MaintenanceSuppliers } from "./MaintenanceSuppliers";
import { BulkMaintenanceOperations } from "./BulkMaintenanceOperations";

interface AdvancedMaintenancePanelProps {
  aquariumId: string;
  userId: string;
}

export function AdvancedMaintenancePanel({ aquariumId, userId }: AdvancedMaintenancePanelProps) {
  const [activeTab, setActiveTab] = useState("analytics");

  const tabs = [
    {
      value: "analytics",
      label: "Analytics",
      icon: <BarChart3 className="h-4 w-4" />,
      component: <MaintenanceAnalytics aquariumId={aquariumId} userId={userId} />
    },
    {
      value: "scheduler",
      label: "Smart Scheduler",
      icon: <Calendar className="h-4 w-4" />,
      component: <MaintenanceScheduler aquariumId={aquariumId} userId={userId} />
    },
    {
      value: "templates",
      label: "Templates",
      icon: <Wrench className="h-4 w-4" />,
      component: <MaintenanceTemplates aquariumId={aquariumId} userId={userId} />
    },
    {
      value: "costs",
      label: "Cost Tracking",
      icon: <DollarSign className="h-4 w-4" />,
      component: <MaintenanceCostTracker aquariumId={aquariumId} userId={userId} />
    },
    {
      value: "notifications",
      label: "Notifications",
      icon: <Bell className="h-4 w-4" />,
      component: <NotificationPreferences userId={userId} />
    },
    {
      value: "warranties",
      label: "Warranties",
      icon: <Settings className="h-4 w-4" />,
      component: <EquipmentWarranties aquariumId={aquariumId} userId={userId} />
    },
    {
      value: "suppliers",
      label: "Suppliers",
      icon: <Users className="h-4 w-4" />,
      component: <MaintenanceSuppliers userId={userId} />
    },
    {
      value: "bulk",
      label: "Bulk Operations",
      icon: <Clock className="h-4 w-4" />,
      component: <BulkMaintenanceOperations aquariumId={aquariumId} userId={userId} />
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Advanced Maintenance
            </CardTitle>
            <CardDescription>
              Professional maintenance management tools
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-gradient-to-r from-primary/20 to-secondary/20">
            Pro Feature
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-6">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value}
                className="flex items-center gap-1 text-xs"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.component}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}