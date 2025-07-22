import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Database, 
  Plus,
  Fish,
  Droplets,
  Target,
  Clock,
  Activity
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  customMetrics: number;
  dataRecords: number;
  activeAquariums: any[];
  waterQualityTrend: Array<{date: string, ph: number, temperature: number, aquarium_name?: string}>;
  livestockGrowth: Array<{month: string, count: number}>;
  maintenanceCompletion: Array<{type: string, completed: number, total: number}>;
  aquariumBreakdown: Array<{name: string, livestock_count: number, last_test: string}>;
}

export const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    customMetrics: 0,
    dataRecords: 0,
    activeAquariums: [],
    waterQualityTrend: [],
    livestockGrowth: [],
    maintenanceCompletion: [],
    aquariumBreakdown: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get all aquariums with details
      const { data: aquariums } = await supabase
        .from('aquariums')
        .select('id, name, type')
        .eq('user_id', user!.id);

      if (!aquariums || aquariums.length === 0) {
        setAnalytics({
          customMetrics: 0,
          dataRecords: 0,
          activeAquariums: [],
          waterQualityTrend: [],
          livestockGrowth: [],
          maintenanceCompletion: [],
          aquariumBreakdown: []
        });
        setLoading(false);
        return;
      }

      // Get water parameters for all aquariums
      const { data: waterParams } = await supabase
        .from('water_parameters')
        .select('*, aquariums(name)')
        .eq('user_id', user!.id)
        .order('tested_at', { ascending: false })
        .limit(100);

      // Get livestock for all aquariums
      const { data: livestock } = await supabase
        .from('livestock')
        .select('*, aquariums(name)')
        .eq('user_id', user!.id)
        .order('added_at', { ascending: false });

      // Get maintenance tasks for all aquariums
      const { data: maintenance } = await supabase
        .from('maintenance')
        .select('*, aquariums(name)')
        .eq('user_id', user!.id)
        .order('due_date', { ascending: false })
        .limit(100);

      // Process data for charts
      const waterQualityTrend = generateWaterQualityTrend(waterParams || []);
      const livestockGrowth = generateLivestockGrowth(livestock || []);
      const maintenanceCompletion = generateMaintenanceCompletion(maintenance || []);
      const aquariumBreakdown = generateAquariumBreakdown(aquariums, livestock || [], waterParams || []);

      setAnalytics({
        customMetrics: 5, // Placeholder for custom metrics
        dataRecords: (waterParams?.length || 0) + (livestock?.length || 0) + (maintenance?.length || 0),
        activeAquariums: aquariums,
        waterQualityTrend,
        livestockGrowth,
        maintenanceCompletion,
        aquariumBreakdown
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWaterQualityTrend = (waterParams: any[]) => {
    if (!waterParams || waterParams.length === 0) {
      // Generate mock data if no real data exists
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push({
          date: date.toLocaleDateString(),
          ph: 7.2 + Math.random() * 0.6,
          temperature: 24 + Math.random() * 2
        });
      }
      return last7Days;
    }

    // Process real water parameter data by date
    const dailyData = new Map();
    waterParams.forEach(param => {
      const date = new Date(param.tested_at).toLocaleDateString();
      if (!dailyData.has(date)) {
        dailyData.set(date, { ph: [], temperature: [], count: 0 });
      }
      const dayData = dailyData.get(date);
      if (param.ph) dayData.ph.push(param.ph);
      if (param.temperature) dayData.temperature.push(param.temperature);
      dayData.count++;
    });

    return Array.from(dailyData.entries())
      .map(([date, data]) => ({
        date,
        ph: data.ph.length > 0 ? data.ph.reduce((a: number, b: number) => a + b, 0) / data.ph.length : 0,
        temperature: data.temperature.length > 0 ? data.temperature.reduce((a: number, b: number) => a + b, 0) / data.temperature.length : 0,
        aquarium_name: `${data.count} readings`
      }))
      .slice(-7); // Last 7 days
  };

  const generateLivestockGrowth = (livestock: any[]) => {
    if (!livestock || livestock.length === 0) {
      return [];
    }

    const monthlyData = new Map();
    livestock.forEach(item => {
      const month = new Date(item.added_at || item.created_at).toLocaleDateString('en-US', { month: 'short' });
      monthlyData.set(month, (monthlyData.get(month) || 0) + (item.quantity || 1));
    });
    
    return Array.from(monthlyData.entries()).map(([month, count]) => ({ month, count }));
  };

  const generateMaintenanceCompletion = (maintenance: any[]) => {
    const types = ['Water Change', 'Filter Clean', 'Equipment Check', 'Glass Clean'];
    return types.map(type => {
      const typeTasks = maintenance.filter(m => m.task && m.task.toLowerCase().includes(type.toLowerCase().split(' ')[0]));
      const completed = typeTasks.filter(m => m.completed_date).length;
      return { type, completed, total: typeTasks.length || 1 };
    });
  };

  const generateAquariumBreakdown = (aquariums: any[], livestock: any[], waterParams: any[]) => {
    return aquariums.map(aquarium => {
      const aquariumLivestock = livestock.filter(l => l.aquarium_id === aquarium.id);
      const aquariumWaterParams = waterParams.filter(w => w.aquarium_id === aquarium.id);
      const livestockCount = aquariumLivestock.reduce((sum, l) => sum + (l.quantity || 1), 0);
      const lastTest = aquariumWaterParams.length > 0 
        ? new Date(aquariumWaterParams[0].tested_at).toLocaleDateString()
        : 'No tests recorded';

      return {
        name: aquarium.name,
        livestock_count: livestockCount,
        last_test: lastTest
      };
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Track trends and insights across all your aquarium data
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Custom Metric
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custom Metrics</p>
                <p className="text-2xl font-bold">{analytics.customMetrics}</p>
                <p className="text-xs text-muted-foreground mt-1">User-created tracking metrics</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Records</p>
                <p className="text-2xl font-bold">{analytics.dataRecords}</p>
                <p className="text-xs text-muted-foreground mt-1">Total logged measurements</p>
              </div>
              <Database className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Aquariums</p>
                <p className="text-2xl font-bold">{analytics.activeAquariums.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Being tracked in analytics</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Insights</p>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground mt-1">AI-generated insights</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aquarium Breakdown */}
      {analytics.activeAquariums.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fish className="h-5 w-5" />
              Aquarium Overview - All {analytics.activeAquariums.length} tank{analytics.activeAquariums.length !== 1 ? 's' : ''} included
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.aquariumBreakdown.map((aquarium, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-medium">{aquarium.name}</h4>
                  <div className="text-sm text-muted-foreground space-y-1 mt-2">
                    <p>Livestock: {aquarium.livestock_count} fish</p>
                    <p>Last water test: {aquarium.last_test}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {analytics.activeAquariums.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Fish className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Aquariums Found</h3>
            <p className="text-muted-foreground">
              Create your first aquarium to start tracking analytics data.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="water">Water Quality</TabsTrigger>
          <TabsTrigger value="livestock">Livestock</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  Water Quality Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.waterQualityTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="ph" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fish className="h-5 w-5" />
                  Livestock Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.livestockGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="water" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Water Parameter Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.waterQualityTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="ph" stroke="#3b82f6" strokeWidth={2} name="pH" />
                  <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} name="Temperature (°C)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="livestock" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Livestock Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.livestockGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.maintenanceCompletion}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#3b82f6" />
                  <Bar dataKey="total" fill="#e5e7eb" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};