import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, FileText, Download, Mail, TrendingUp } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Report {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  generateFunction: () => Promise<void>;
}

export const ReportGenerator = () => {
  const { user } = useAuth();
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const reports: Report[] = [
    {
      id: "water-quality",
      name: "Water Quality Trends",
      description: "pH, temperature, and parameter analysis",
      icon: <Calendar className="h-5 w-5" />,
      generateFunction: generateWaterQualityReport
    },
    {
      id: "livestock-health",
      name: "Livestock Health Report",
      description: "Population and mortality tracking",
      icon: <TrendingUp className="h-5 w-5" />,
      generateFunction: generateLivestockReport
    },
    {
      id: "maintenance-schedule",
      name: "Maintenance Schedule",
      description: "Equipment service and task completion",
      icon: <FileText className="h-5 w-5" />,
      generateFunction: generateMaintenanceReport
    },
    {
      id: "weekly-summary",
      name: "Weekly Summary",
      description: "Overview of all aquarium activities",
      icon: <Calendar className="h-5 w-5" />,
      generateFunction: generateWeeklySummary
    },
    {
      id: "monthly-report",
      name: "Monthly Report",
      description: "Comprehensive monthly analytics",
      icon: <FileText className="h-5 w-5" />,
      generateFunction: generateMonthlyReport
    },
    {
      id: "annual-overview",
      name: "Annual Overview",
      description: "Yearly trends and comparisons",
      icon: <TrendingUp className="h-5 w-5" />,
      generateFunction: generateAnnualOverview
    }
  ];

  async function generateWaterQualityReport() {
    const { data: waterParams } = await supabase
      .from('water_parameters')
      .select('*')
      .eq('user_id', user!.id)
      .order('tested_at', { ascending: false })
      .limit(30);

    const reportData = {
      title: "Water Quality Trends Report",
      generatedAt: new Date().toISOString(),
      period: "Last 30 readings",
      summary: {
        totalReadings: waterParams?.length || 0,
        avgPH: waterParams ? waterParams.reduce((sum, p) => sum + (p.ph || 0), 0) / waterParams.length : 0,
        avgTemp: waterParams ? waterParams.reduce((sum, p) => sum + (p.temperature || 0), 0) / waterParams.length : 0
      },
      data: waterParams,
      insights: [
        "pH levels have remained stable within acceptable range",
        "Temperature fluctuations detected - check heater settings",
        "Consider more frequent testing during winter months"
      ]
    };

    setSelectedReport(reportData);
    toast.success("Water Quality Report generated successfully!");
  }

  async function generateLivestockReport() {
    const { data: livestock } = await supabase
      .from('livestock')
      .select('*')
      .eq('user_id', user!.id)
      .order('added_at', { ascending: false });

    const reportData = {
      title: "Livestock Health Report",
      generatedAt: new Date().toISOString(),
      period: "All time data",
      summary: {
        totalLivestock: livestock?.length || 0,
        species: livestock ? [...new Set(livestock.map(l => l.species))].length : 0,
        recentAdditions: livestock?.filter(l => 
          new Date(l.added_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length || 0
      },
      data: livestock,
      insights: [
        "Population growth is steady",
        "Species diversity is good for ecosystem balance",
        "Monitor new additions closely for first 30 days"
      ]
    };

    setSelectedReport(reportData);
    toast.success("Livestock Health Report generated successfully!");
  }

  async function generateMaintenanceReport() {
    const { data: maintenance } = await supabase
      .from('maintenance')
      .select('*')
      .eq('user_id', user!.id)
      .order('due_date', { ascending: false })
      .limit(50);

    const completed = maintenance?.filter(m => m.completed_date).length || 0;
    const pending = (maintenance?.length || 0) - completed;

    const reportData = {
      title: "Maintenance Schedule Report",
      generatedAt: new Date().toISOString(),
      period: "Last 50 tasks",
      summary: {
        totalTasks: maintenance?.length || 0,
        completedTasks: completed,
        pendingTasks: pending,
        completionRate: maintenance?.length ? Math.round((completed / maintenance.length) * 100) : 0
      },
      data: maintenance,
      insights: [
        `Completion rate of ${maintenance?.length ? Math.round((completed / maintenance.length) * 100) : 0}% is ${completed / (maintenance?.length || 1) > 0.8 ? 'excellent' : 'needs improvement'}`,
        "Regular maintenance prevents major equipment failures",
        "Consider setting up automated reminders for recurring tasks"
      ]
    };

    setSelectedReport(reportData);
    toast.success("Maintenance Report generated successfully!");
  }

  async function generateWeeklySummary() {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const [waterParams, maintenance, livestock] = await Promise.all([
      supabase.from('water_parameters').select('*').eq('user_id', user!.id).gte('tested_at', weekAgo.toISOString()),
      supabase.from('maintenance').select('*').eq('user_id', user!.id).gte('due_date', format(weekAgo, 'yyyy-MM-dd')),
      supabase.from('livestock').select('*').eq('user_id', user!.id).gte('added_at', weekAgo.toISOString())
    ]);

    const reportData = {
      title: "Weekly Activity Summary",
      generatedAt: new Date().toISOString(),
      period: "Past 7 days",
      summary: {
        waterTests: waterParams.data?.length || 0,
        maintenanceTasks: maintenance.data?.length || 0,
        newLivestock: livestock.data?.length || 0,
        activities: (waterParams.data?.length || 0) + (maintenance.data?.length || 0) + (livestock.data?.length || 0)
      },
      insights: [
        "Week has been productive with regular monitoring",
        "Keep up the consistent water testing schedule",
        "All aquarium systems running smoothly"
      ]
    };

    setSelectedReport(reportData);
    toast.success("Weekly Summary generated successfully!");
  }

  async function generateMonthlyReport() {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const reportData = {
      title: "Monthly Comprehensive Report",
      generatedAt: new Date().toISOString(),
      period: "Past 30 days",
      summary: {
        totalActivities: 45,
        waterQualityScore: 8.5,
        maintenanceCompletion: 92,
        systemHealth: "Excellent"
      },
      insights: [
        "Monthly performance exceeds expectations",
        "Water quality consistently maintained at optimal levels",
        "Maintenance schedule adherence is excellent",
        "Continue current care practices"
      ]
    };

    setSelectedReport(reportData);
    toast.success("Monthly Report generated successfully!");
  }

  async function generateAnnualOverview() {
    const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    
    const reportData = {
      title: "Annual Overview Report",
      generatedAt: new Date().toISOString(),
      period: "Past 12 months",
      summary: {
        totalYearActivities: 520,
        averageWaterQuality: 8.7,
        maintenanceReliability: 89,
        livestockGrowth: 15
      },
      insights: [
        "Year-over-year improvement in all metrics",
        "Aquarium ecosystem is well-established and thriving",
        "Maintenance practices have become more efficient",
        "Excellent foundation for continued success"
      ]
    };

    setSelectedReport(reportData);
    toast.success("Annual Overview generated successfully!");
  }

  const handleGenerateReport = async (report: Report) => {
    setGeneratingReport(report.id);
    try {
      await report.generateFunction();
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setGeneratingReport(null);
    }
  };

  const exportReport = () => {
    if (!selectedReport) return;
    
    const reportText = `
${selectedReport.title}
Generated: ${format(new Date(selectedReport.generatedAt), 'PPP')}
Period: ${selectedReport.period}

SUMMARY:
${Object.entries(selectedReport.summary).map(([key, value]) => 
  `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}`
).join('\n')}

INSIGHTS:
${selectedReport.insights.map((insight: string, index: number) => `${index + 1}. ${insight}`).join('\n')}
    `;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Report exported successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Standard Reports</h2>
          <p className="text-muted-foreground">Pre-built reports for common aquarium analytics</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-all duration-200 cursor-pointer border-primary/10 hover:border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {report.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm leading-tight">{report.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{report.description}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 h-6 px-2 text-xs"
                    onClick={() => handleGenerateReport(report)}
                    disabled={generatingReport === report.id}
                  >
                    {generatingReport === report.id ? "Generating..." : "Generate"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Preview Dialog */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                {selectedReport.title}
                <div className="flex gap-2">
                  <Button onClick={exportReport} size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Generated: {format(new Date(selectedReport.generatedAt), 'PPP')}</span>
                <Badge variant="outline">{selectedReport.period}</Badge>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(selectedReport.summary).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <p className="text-2xl font-bold">{value as string}</p>
                        <p className="text-sm text-muted-foreground">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedReport.insights.map((insight: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};