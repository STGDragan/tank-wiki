import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, Receipt, Trash2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface MaintenanceCostTrackerProps {
  aquariumId: string;
  userId: string;
}

interface MaintenanceCost {
  id: string;
  maintenance_id: string;
  cost_amount: number;
  currency: string;
  cost_type: string;
  vendor_name: string;
  receipt_url: string;
  notes: string;
  created_at: string;
  maintenance: {
    task: string;
    due_date: string;
  };
}

export function MaintenanceCostTracker({ aquariumId, userId }: MaintenanceCostTrackerProps) {
  const [costs, setCosts] = useState<MaintenanceCost[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [newCost, setNewCost] = useState({
    maintenance_id: "",
    cost_amount: "",
    cost_type: "supplies",
    vendor_name: "",
    receipt_url: "",
    notes: ""
  });

  useEffect(() => {
    loadData();
  }, [aquariumId, userId]);

  const loadData = async () => {
    try {
      // Load maintenance costs
      const { data: costsData } = await supabase
        .from('maintenance_costs')
        .select(`
          *,
          maintenance!inner(task, due_date, aquarium_id)
        `)
        .eq('user_id', userId)
        .eq('maintenance.aquarium_id', aquariumId)
        .order('created_at', { ascending: false });

      // Load maintenance tasks for the dropdown
      const { data: tasksData } = await supabase
        .from('maintenance')
        .select('id, task, due_date, completed_date')
        .eq('aquarium_id', aquariumId)
        .eq('user_id', userId)
        .order('due_date', { ascending: false });

      setCosts(costsData || []);
      setMaintenanceTasks(tasksData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCost = async () => {
    try {
      const { error } = await supabase.from('maintenance_costs').insert({
        maintenance_id: newCost.maintenance_id,
        user_id: userId,
        cost_amount: parseFloat(newCost.cost_amount),
        cost_type: newCost.cost_type,
        vendor_name: newCost.vendor_name,
        receipt_url: newCost.receipt_url,
        notes: newCost.notes
      });

      if (error) throw error;

      toast({
        title: "Cost Added",
        description: "Maintenance cost has been recorded successfully",
      });

      setNewCost({
        maintenance_id: "",
        cost_amount: "",
        cost_type: "supplies",
        vendor_name: "",
        receipt_url: "",
        notes: ""
      });
      setIsAddDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error adding cost:', error);
      toast({
        title: "Error",
        description: "Failed to add maintenance cost",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCost = async (costId: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_costs')
        .delete()
        .eq('id', costId);

      if (error) throw error;

      toast({
        title: "Cost Deleted",
        description: "Maintenance cost has been removed",
      });

      loadData();
    } catch (error) {
      console.error('Error deleting cost:', error);
      toast({
        title: "Error",
        description: "Failed to delete cost",
        variant: "destructive",
      });
    }
  };

  const getCostTypeColor = (type: string) => {
    switch (type) {
      case 'supplies': return 'default';
      case 'labor': return 'secondary';
      case 'equipment': return 'destructive';
      case 'other': return 'outline';
      default: return 'default';
    }
  };

  const totalCosts = costs.reduce((sum, cost) => sum + cost.cost_amount, 0);
  const averageCost = costs.length ? totalCosts / costs.length : 0;

  if (loading) {
    return <div className="p-4">Loading cost data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCosts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time maintenance costs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Cost</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per maintenance task</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Receipt className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{costs.length}</div>
            <p className="text-xs text-muted-foreground">Cost records</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Cost Dialog */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Cost History</h3>
          <p className="text-sm text-muted-foreground">
            Track maintenance expenses and receipts
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Cost
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Maintenance Cost</DialogTitle>
              <DialogDescription>
                Record expenses for maintenance activities
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="maintenance">Maintenance Task</Label>
                <Select value={newCost.maintenance_id} onValueChange={(value) => setNewCost({...newCost, maintenance_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select maintenance task..." />
                  </SelectTrigger>
                  <SelectContent>
                    {maintenanceTasks.map((task: any) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.task} - {new Date(task.due_date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cost_amount">Cost Amount ($)</Label>
                  <Input
                    id="cost_amount"
                    type="number"
                    step="0.01"
                    value={newCost.cost_amount}
                    onChange={(e) => setNewCost({...newCost, cost_amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="cost_type">Cost Type</Label>
                  <Select value={newCost.cost_type} onValueChange={(value) => setNewCost({...newCost, cost_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supplies">Supplies</SelectItem>
                      <SelectItem value="labor">Labor</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="vendor_name">Vendor/Store</Label>
                <Input
                  id="vendor_name"
                  value={newCost.vendor_name}
                  onChange={(e) => setNewCost({...newCost, vendor_name: e.target.value})}
                  placeholder="Where did you purchase this?"
                />
              </div>

              <div>
                <Label htmlFor="receipt_url">Receipt URL (optional)</Label>
                <Input
                  id="receipt_url"
                  value={newCost.receipt_url}
                  onChange={(e) => setNewCost({...newCost, receipt_url: e.target.value})}
                  placeholder="Link to receipt or invoice"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newCost.notes}
                  onChange={(e) => setNewCost({...newCost, notes: e.target.value})}
                  placeholder="Additional details about this expense..."
                />
              </div>

              <Button 
                onClick={handleAddCost} 
                disabled={!newCost.maintenance_id || !newCost.cost_amount}
                className="w-full"
              >
                Add Cost Record
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Costs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costs.map((cost) => (
                <TableRow key={cost.id}>
                  <TableCell>
                    {new Date(cost.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="max-w-48 truncate">
                    {cost.maintenance.task}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getCostTypeColor(cost.cost_type)}>
                      {cost.cost_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{cost.vendor_name || '-'}</TableCell>
                  <TableCell className="font-medium">
                    ${cost.cost_amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {cost.receipt_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(cost.receipt_url, '_blank')}
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCost(cost.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {costs.length === 0 && (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Cost Records</h3>
              <p className="text-muted-foreground">
                Start tracking your maintenance expenses to analyze costs over time
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}