import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Clock, DollarSign, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MaintenanceAnalyticsProps {
  aquariumId: string;
  userId: string;
}

export function MaintenanceAnalytics({ aquariumId, userId }: MaintenanceAnalyticsProps) {
  const [analytics, setAnalytics] = useState({
    completionRate: 0,
    averageCost: 0,
    overdueCount: 0,
    totalTasks: 0,
    monthlyTrends: [],
    costBreakdown: [],
    equipmentHealth: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [aquariumId, userId]);

  const loadAnalytics = async () => {
    try {
      // Get maintenance tasks for analytics
      const { data: tasks } = await supabase
        .from('maintenance')
        .select(`
          *,
          equipment:equipment_id(type),
          maintenance_costs(cost_amount)
        `)
        .eq('aquarium_id', aquariumId)
        .eq('user_id', userId);

      if (tasks) {
        const now = new Date();
        const completedTasks = tasks.filter(t => t.completed_date);
        const overdueTasks = tasks.filter(t => !t.completed_date && new Date(t.due_date) < now);
        
        const totalCosts = tasks.reduce((sum, task) => {
          const taskCosts = task.maintenance_costs?.reduce((taskSum: number, cost: any) => taskSum + parseFloat(cost.cost_amount || 0), 0) || 0;
          return sum + taskCosts;
        }, 0);

        setAnalytics({
          completionRate: tasks.length ? (completedTasks.length / tasks.length) * 100 : 0,
          averageCost: tasks.length ? totalCosts / tasks.length : 0,
          overdueCount: overdueTasks.length,
          totalTasks: tasks.length,
          monthlyTrends: generateMonthlyTrends(tasks),
          costBreakdown: generateCostBreakdown(tasks),
          equipmentHealth: generateEquipmentHealth(tasks)
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyTrends = (tasks: any[]) => {
    const months = {};
    tasks.forEach(task => {
      if (task.completed_date) {
        const month = new Date(task.completed_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        months[month] = (months[month] || 0) + 1;
      }
    });
    return Object.entries(months).map(([month, count]) => ({ month, count })).slice(-6);
  };

  const generateCostBreakdown = (tasks: any[]) => {
    const breakdown = {};
    tasks.forEach(task => {
      const equipmentType = task.equipment?.type || 'Other';
      const costs = task.maintenance_costs?.reduce((sum: number, cost: any) => sum + parseFloat(cost.cost_amount || 0), 0) || 0;
      breakdown[equipmentType] = (breakdown[equipmentType] || 0) + costs;
    });
    return Object.entries(breakdown).map(([type, cost]) => ({ type, cost }));
  };

  const generateEquipmentHealth = (tasks: any[]) => {
    const equipment = {};
    tasks.forEach(task => {
      const type = task.equipment?.type || 'Other';
      if (!equipment[type]) equipment[type] = { total: 0, completed: 0, overdue: 0 };
      equipment[type].total++;
      if (task.completed_date) equipment[type].completed++;
      if (!task.completed_date && new Date(task.due_date) < new Date()) equipment[type].overdue++;
    });

    return Object.entries(equipment).map(([type, stats]: [string, any]) => ({
      type,
      health: stats.total ? ((stats.completed / stats.total) * 100) : 100,
      overdue: stats.overdue
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return <div className="p-4">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</div>
            <Progress value={analytics.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.averageCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">per task</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overdueCount}</div>
            <p className="text-xs text-muted-foreground">require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTasks}</div>
            <p className="text-xs text-muted-foreground">all time</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Completion Trends</CardTitle>
            <CardDescription>Tasks completed over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Cost by Equipment Type</CardTitle>
            <CardDescription>Total maintenance costs breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.costBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="cost"
                >
                  {analytics.costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Health */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Health Score</CardTitle>
          <CardDescription>Maintenance completion rate by equipment type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.equipmentHealth.map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.type}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.overdue > 0 ? "destructive" : "secondary"}>
                        {item.overdue} overdue
                      </Badge>
                      <span className="text-sm">{item.health.toFixed(1)}%</span>
                    </div>
                  </div>
                  <Progress value={item.health} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}