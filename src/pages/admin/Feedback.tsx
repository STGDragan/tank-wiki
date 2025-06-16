
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Eye, Filter, Search, Calendar, User, Globe, Monitor } from "lucide-react";
import { format } from "date-fns";

interface FeedbackItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  image_url?: string;
  browser_info?: any;
  page_url?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  profiles?: {
    full_name?: string;
  };
}

const AdminFeedback = () => {
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['admin-feedback', statusFilter, typeFilter, priorityFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('feedback')
        .select(`
          *,
          profiles(full_name)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }
      if (priorityFilter !== 'all') {
        query = query.eq('priority', priorityFilter);
      }
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FeedbackItem[];
    },
  });

  const updateFeedbackMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FeedbackItem> }) => {
      const { error } = await supabase
        .from('feedback')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          ...(updates.status === 'resolved' && !updates.resolved_at ? { resolved_at: new Date().toISOString() } : {}),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Feedback updated",
        description: "The feedback has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
      setSelectedFeedback(null);
    },
    onError: (error) => {
      console.error('Error updating feedback:', error);
      toast({
        title: "Update failed",
        description: "Failed to update feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'in_progress': return 'secondary';
      case 'resolved': return 'outline';
      case 'closed': return 'destructive';
      default: return 'default';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'low': return 'outline';
      case 'medium': return 'default';
      case 'high': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'default';
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'bug': return 'destructive';
      case 'suggestion': return 'default';
      case 'issue': return 'secondary';
      case 'general': return 'outline';
      default: return 'default';
    }
  };

  const handleStatusChange = (id: string, status: string) => {
    updateFeedbackMutation.mutate({ id, updates: { status } });
  };

  const handlePriorityChange = (id: string, priority: string) => {
    updateFeedbackMutation.mutate({ id, updates: { priority } });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading feedback...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Feedback Management</h1>
          <p className="text-muted-foreground">Review and manage user feedback submissions</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{feedback.length} total submissions</Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                  <SelectItem value="issue">Issue</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedback.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium max-w-xs">
                    <div className="truncate">{item.title}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {item.description.slice(0, 60)}...
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeBadgeVariant(item.type)}>
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={item.status} 
                      onValueChange={(value) => handleStatusChange(item.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={item.priority} 
                      onValueChange={(value) => handlePriorityChange(item.id, value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {item.profiles?.full_name || 'Unknown User'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {format(new Date(item.created_at), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFeedback(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{item.title}</DialogTitle>
                          <DialogDescription>
                            Feedback submitted on {format(new Date(item.created_at), 'PPpp')}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="text-sm font-medium">Type</label>
                              <Badge variant={getTypeBadgeVariant(item.type)} className="mt-1">
                                {item.type}
                              </Badge>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Status</label>
                              <Badge variant={getStatusBadgeVariant(item.status)} className="mt-1">
                                {item.status}
                              </Badge>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Priority</label>
                              <Badge variant={getPriorityBadgeVariant(item.priority)} className="mt-1">
                                {item.priority}
                              </Badge>
                            </div>
                            <div>
                              <label className="text-sm font-medium">User</label>
                              <p className="text-sm mt-1">{item.profiles?.full_name || 'Unknown User'}</p>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium">Description</label>
                            <div className="mt-2 p-4 bg-muted rounded-lg">
                              <p className="text-sm whitespace-pre-wrap">{item.description}</p>
                            </div>
                          </div>

                          {item.image_url && (
                            <div>
                              <label className="text-sm font-medium">Attachment</label>
                              <div className="mt-2">
                                <img 
                                  src={item.image_url} 
                                  alt="Feedback attachment" 
                                  className="max-w-full h-auto rounded-lg border"
                                />
                              </div>
                            </div>
                          )}

                          {item.page_url && (
                            <div>
                              <label className="text-sm font-medium flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Page URL
                              </label>
                              <p className="text-sm text-muted-foreground mt-1 break-all">{item.page_url}</p>
                            </div>
                          )}

                          {item.browser_info && (
                            <div>
                              <label className="text-sm font-medium flex items-center gap-2">
                                <Monitor className="h-4 w-4" />
                                Browser Information
                              </label>
                              <div className="mt-2 p-4 bg-muted rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <strong>User Agent:</strong> {item.browser_info.userAgent}
                                  </div>
                                  <div>
                                    <strong>Platform:</strong> {item.browser_info.platform}
                                  </div>
                                  <div>
                                    <strong>Language:</strong> {item.browser_info.language}
                                  </div>
                                  <div>
                                    <strong>Screen:</strong> {item.browser_info.screenResolution}
                                  </div>
                                  <div>
                                    <strong>Timezone:</strong> {item.browser_info.timezone}
                                  </div>
                                  <div>
                                    <strong>Online:</strong> {item.browser_info.onLine ? 'Yes' : 'No'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {(item.updated_at !== item.created_at || item.resolved_at) && (
                            <div className="border-t pt-4">
                              <label className="text-sm font-medium">Timeline</label>
                              <div className="mt-2 space-y-2 text-sm">
                                <div>Created: {format(new Date(item.created_at), 'PPpp')}</div>
                                {item.updated_at !== item.created_at && (
                                  <div>Updated: {format(new Date(item.updated_at), 'PPpp')}</div>
                                )}
                                {item.resolved_at && (
                                  <div>Resolved: {format(new Date(item.resolved_at), 'PPpp')}</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {feedback.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No feedback found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFeedback;
