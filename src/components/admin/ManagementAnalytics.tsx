import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Users, AlertTriangle, TrendingUp, Download, Calendar } from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalAquariums: number;
  totalFeedback: number;
  errorCount: number;
  userGrowth: Array<{ date: string; users: number }>;
  feedbackByType: Array<{ type: string; count: number; color: string }>;
  aquariumsOverTime: Array<{ date: string; count: number }>;
}

export function ManagementAnalytics() {
  const [timeRange, setTimeRange] = useState("7d");
  const [reportType, setReportType] = useState("overview");

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['management-analytics', timeRange],
    queryFn: async (): Promise<AnalyticsData> => {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case "7d":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(endDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      // Fetch user statistics
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, updated_at');
      
      if (profilesError) throw profilesError;

      // Fetch aquarium statistics
      const { data: aquariums, error: aquariumsError } = await supabase
        .from('aquariums')
        .select('id, created_at, user_id');
      
      if (aquariumsError) throw aquariumsError;

      // Fetch feedback statistics
      const { data: feedback, error: feedbackError } = await supabase
        .from('feedback')
        .select('id, type, status, created_at');
      
      if (feedbackError) throw feedbackError;

      // Calculate metrics
      const totalUsers = profiles?.length || 0;
      const recentUsers = profiles?.filter(p => 
        new Date(p.updated_at) >= startDate
      ).length || 0;
      
      const totalAquariums = aquariums?.length || 0;
      const totalFeedback = feedback?.length || 0;
      
      // Count error feedback as proxy for errors
      const errorCount = feedback?.filter(f => f.type === 'bug').length || 0;

      // Generate user growth data (using updated_at as proxy for registration)
      const userGrowth = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const usersUpToDate = profiles?.filter(p => 
          new Date(p.updated_at) <= d
        ).length || 0;
        userGrowth.push({ date: dateStr, users: usersUpToDate });
      }

      // Generate feedback by type data
      const feedbackTypes = feedback?.reduce((acc, f) => {
        acc[f.type] = (acc[f.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];
      const feedbackByType = Object.entries(feedbackTypes).map(([type, count], index) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count,
        color: colors[index % colors.length]
      }));

      // Generate aquariums over time
      const aquariumsOverTime = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const aquariumsUpToDate = aquariums?.filter(a => 
          new Date(a.created_at) <= d
        ).length || 0;
        aquariumsOverTime.push({ date: dateStr, count: aquariumsUpToDate });
      }

      return {
        totalUsers,
        activeUsers: totalUsers, // For now, consider all users as active
        totalAquariums,
        totalFeedback,
        errorCount,
        userGrowth: userGrowth.slice(-10), // Last 10 data points
        feedbackByType,
        aquariumsOverTime: aquariumsOverTime.slice(-10)
      };
    },
  });

  const generateReport = () => {
    if (!analytics) return;
    
    const reportData = {
      reportType,
      timeRange,
      generatedAt: new Date().toISOString(),
      data: analytics
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `management-analytics-${reportType}-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Management Analytics
          </CardTitle>
          <CardDescription>Loading analytics data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Management Analytics
            </CardTitle>
            <CardDescription>
              Site traffic, user metrics, and system health monitoring
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7d</SelectItem>
                <SelectItem value="30d">30d</SelectItem>
                <SelectItem value="90d">90d</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateReport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{analytics?.totalUsers || 0}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Aquariums</p>
                  <p className="text-2xl font-bold">{analytics?.totalAquariums || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Feedback Items</p>
                  <p className="text-2xl font-bold">{analytics?.totalFeedback || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Error Reports</p>
                  <p className="text-2xl font-bold text-destructive">{analytics?.errorCount || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs value={reportType} onValueChange={setReportType} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={analytics?.userGrowth || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Feedback Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={analytics?.feedbackByType || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ type, count }) => `${type}: ${count}`}
                      >
                        {analytics?.feedbackByType?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Registration Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.userGrowth || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Feedback Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.feedbackByType?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.type}</span>
                      </div>
                      <Badge variant="secondary">{item.count} items</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aquarium Creation Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics?.aquariumsOverTime || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}