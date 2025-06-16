
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, FileText } from "lucide-react";
import { format } from "date-fns";

interface AuditLogEntry {
  id: string;
  admin_user_id: string;
  action_type: string;
  target_type: string;
  target_id?: string;
  old_values?: any;
  new_values?: any;
  metadata?: any;
  created_at: string;
  admin_profile?: {
    full_name?: string;
  };
}

export function AuditTrailSection() {
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      // First get the audit logs
      const { data: logs, error: logsError } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      if (!logs || logs.length === 0) {
        return [];
      }

      // Get admin profiles for the logs
      const adminIds = [...new Set(logs.map(log => log.admin_user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', adminIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return logs.map(log => ({
        ...log,
        admin_profile: profilesMap.get(log.admin_user_id)
      })) as AuditLogEntry[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getActionBadgeVariant = (actionType: string) => {
    switch (actionType) {
      case 'INSERT':
        return 'default';
      case 'UPDATE':
        return 'secondary';
      case 'DELETE':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getTargetTypeLabel = (targetType: string) => {
    switch (targetType) {
      case 'user_role':
        return 'User Role';
      case 'subscription_override':
        return 'Subscription Override';
      case 'granted_subscription':
        return 'Granted Subscription';
      default:
        return targetType;
    }
  };

  const formatChangeDetails = (actionType: string, oldValues: any, newValues: any) => {
    if (actionType === 'INSERT' && newValues) {
      return `Created: ${JSON.stringify(newValues, null, 2)}`;
    }
    if (actionType === 'DELETE' && oldValues) {
      return `Deleted: ${JSON.stringify(oldValues, null, 2)}`;
    }
    if (actionType === 'UPDATE' && oldValues && newValues) {
      return `Changed from: ${JSON.stringify(oldValues, null, 2)} to: ${JSON.stringify(newValues, null, 2)}`;
    }
    return 'No details available';
  };

  if (isLoading) {
    return <div>Loading audit trail...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Admin Audit Trail
        </CardTitle>
        <CardDescription>
          Track all administrative actions and changes. Last 100 entries shown.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {auditLogs?.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getActionBadgeVariant(log.action_type)}>
                      {log.action_type}
                    </Badge>
                    <Badge variant="outline">
                      {getTargetTypeLabel(log.target_type)}
                    </Badge>
                    {log.target_id && (
                      <span className="text-xs text-muted-foreground">
                        ID: {log.target_id.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Admin: {log.admin_profile?.full_name || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {log.admin_user_id.slice(0, 8)}...
                  </p>
                </div>

                {(log.old_values || log.new_values) && (
                  <div className="bg-muted/50 rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Change Details</span>
                    </div>
                    <pre className="text-xs overflow-x-auto">
                      {formatChangeDetails(log.action_type, log.old_values, log.new_values)}
                    </pre>
                  </div>
                )}

                {log.metadata && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Metadata:</span> {JSON.stringify(log.metadata)}
                  </div>
                )}
              </div>
            ))}
            {(!auditLogs || auditLogs.length === 0) && (
              <p className="text-muted-foreground text-center py-8">
                No audit trail entries found.
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
