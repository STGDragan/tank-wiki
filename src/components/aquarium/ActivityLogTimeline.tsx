
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Droplets, TestTube, Filter, Wrench, Fish, Settings, FileText, Trash2 } from "lucide-react";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityLogTimelineProps {
  aquariumId: string;
  canEdit?: boolean;
}

const activityIcons = {
  water_change: <Droplets className="h-4 w-4 text-blue-500" />,
  water_test: <TestTube className="h-4 w-4 text-green-500" />,
  filter_clean: <Filter className="h-4 w-4 text-purple-500" />,
  maintenance: <Wrench className="h-4 w-4 text-orange-500" />,
  livestock_add: <Fish className="h-4 w-4 text-teal-500" />,
  equipment_install: <Settings className="h-4 w-4 text-gray-500" />,
  note: <FileText className="h-4 w-4 text-yellow-500" />,
};

const activityColors = {
  water_change: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700',
  water_test: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700',
  filter_clean: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700',
  maintenance: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700',
  livestock_add: 'bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-700',
  equipment_install: 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700',
  note: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700',
};

export function ActivityLogTimeline({ aquariumId, canEdit = true }: ActivityLogTimelineProps) {
  const { logs, loading, deleteLog } = useActivityLogs(aquariumId);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No activity logs yet. Start logging your aquarium activities!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <Card key={log.id} className={`${activityColors[log.activity_type]} transition-all hover:shadow-md`}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm">
                {activityIcons[log.activity_type]}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-foreground">
                      {log.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {log.activity_type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.logged_at), 'MMM d, yyyy at h:mm a')}
                      </span>
                    </div>
                  </div>
                  
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteLog(log.id)}
                      className="opacity-60 hover:opacity-100 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                {log.description && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {log.description}
                  </p>
                )}
                
                {log.image_url && (
                  <div className="mt-3">
                    <img 
                      src={log.image_url} 
                      alt={log.title}
                      className="rounded-lg max-w-xs max-h-48 object-cover shadow-sm"
                    />
                  </div>
                )}
                
                {log.data && Object.keys(log.data).length > 0 && (
                  <div className="mt-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <details className="text-xs">
                      <summary className="cursor-pointer font-medium text-muted-foreground">
                        View Details
                      </summary>
                      <div className="mt-2 space-y-1">
                        {Object.entries(log.data).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                            </span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
