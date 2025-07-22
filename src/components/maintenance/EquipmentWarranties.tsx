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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Shield, Plus, Calendar as CalendarIcon, Trash2, ExternalLink, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface EquipmentWarrantiesProps {
  aquariumId: string;
  userId: string;
}

interface Warranty {
  id: string;
  equipment_id: string;
  warranty_start_date: string;
  warranty_end_date: string;
  warranty_provider: string;
  warranty_terms: string;
  proof_of_purchase_url: string;
  is_active: boolean;
  equipment: {
    brand: string;
    model: string;
    type: string;
  };
}

export function EquipmentWarranties({ aquariumId, userId }: EquipmentWarrantiesProps) {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [equipment, setEquipment] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [newWarranty, setNewWarranty] = useState({
    equipment_id: "",
    warranty_start_date: undefined as Date | undefined,
    warranty_end_date: undefined as Date | undefined,
    warranty_provider: "",
    warranty_terms: "",
    proof_of_purchase_url: ""
  });

  useEffect(() => {
    loadData();
  }, [aquariumId, userId]);

  const loadData = async () => {
    try {
      // Load warranties
      const { data: warrantiesData } = await supabase
        .from('equipment_warranties')
        .select(`
          *,
          equipment!inner(brand, model, type, aquarium_id)
        `)
        .eq('user_id', userId)
        .eq('equipment.aquarium_id', aquariumId)
        .order('warranty_end_date', { ascending: true });

      // Load equipment
      const { data: equipmentData } = await supabase
        .from('equipment')
        .select('*')
        .eq('aquarium_id', aquariumId)
        .eq('user_id', userId);

      setWarranties(warrantiesData || []);
      setEquipment(equipmentData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWarranty = async () => {
    try {
      const { error } = await supabase.from('equipment_warranties').insert({
        equipment_id: newWarranty.equipment_id,
        user_id: userId,
        warranty_start_date: newWarranty.warranty_start_date?.toISOString().split('T')[0],
        warranty_end_date: newWarranty.warranty_end_date?.toISOString().split('T')[0],
        warranty_provider: newWarranty.warranty_provider,
        warranty_terms: newWarranty.warranty_terms,
        proof_of_purchase_url: newWarranty.proof_of_purchase_url
      });

      if (error) throw error;

      toast({
        title: "Warranty Added",
        description: "Equipment warranty has been recorded successfully",
      });

      setNewWarranty({
        equipment_id: "",
        warranty_start_date: undefined,
        warranty_end_date: undefined,
        warranty_provider: "",
        warranty_terms: "",
        proof_of_purchase_url: ""
      });
      setIsAddDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error adding warranty:', error);
      toast({
        title: "Error",
        description: "Failed to add warranty",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWarranty = async (warrantyId: string) => {
    try {
      const { error } = await supabase
        .from('equipment_warranties')
        .delete()
        .eq('id', warrantyId);

      if (error) throw error;

      toast({
        title: "Warranty Deleted",
        description: "Warranty record has been removed",
      });

      loadData();
    } catch (error) {
      console.error('Error deleting warranty:', error);
      toast({
        title: "Error",
        description: "Failed to delete warranty",
        variant: "destructive",
      });
    }
  };

  const getWarrantyStatus = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return { status: 'expired', label: 'Expired', color: 'destructive' };
    if (daysUntilExpiry <= 30) return { status: 'expiring', label: 'Expiring Soon', color: 'default' };
    return { status: 'active', label: 'Active', color: 'secondary' };
  };

  const activeWarranties = warranties.filter(w => w.is_active && getWarrantyStatus(w.warranty_end_date).status !== 'expired');
  const expiringWarranties = warranties.filter(w => {
    const status = getWarrantyStatus(w.warranty_end_date);
    return w.is_active && (status.status === 'expiring' || status.status === 'expired');
  });

  if (loading) {
    return <div className="p-4">Loading warranty data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Warranties</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWarranties.length}</div>
            <p className="text-xs text-muted-foreground">Currently valid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringWarranties.length}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Warranties</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warranties.length}</div>
            <p className="text-xs text-muted-foreground">All records</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Warranty Dialog */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Equipment Warranties</h3>
          <p className="text-sm text-muted-foreground">
            Track warranty information and expiration dates for your equipment
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Warranty
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Equipment Warranty</DialogTitle>
              <DialogDescription>
                Record warranty information for your equipment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="equipment">Equipment</Label>
                <Select value={newWarranty.equipment_id} onValueChange={(value) => setNewWarranty({...newWarranty, equipment_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment..." />
                  </SelectTrigger>
                  <SelectContent>
                    {equipment.map((eq: any) => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.brand} {eq.model} ({eq.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Warranty Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newWarranty.warranty_start_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newWarranty.warranty_start_date ? format(newWarranty.warranty_start_date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newWarranty.warranty_start_date}
                        onSelect={(date) => setNewWarranty({...newWarranty, warranty_start_date: date})}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Warranty End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newWarranty.warranty_end_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newWarranty.warranty_end_date ? format(newWarranty.warranty_end_date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newWarranty.warranty_end_date}
                        onSelect={(date) => setNewWarranty({...newWarranty, warranty_end_date: date})}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label htmlFor="warranty_provider">Warranty Provider</Label>
                <Input
                  id="warranty_provider"
                  value={newWarranty.warranty_provider}
                  onChange={(e) => setNewWarranty({...newWarranty, warranty_provider: e.target.value})}
                  placeholder="Manufacturer, retailer, or insurance company"
                />
              </div>

              <div>
                <Label htmlFor="warranty_terms">Warranty Terms</Label>
                <Textarea
                  id="warranty_terms"
                  value={newWarranty.warranty_terms}
                  onChange={(e) => setNewWarranty({...newWarranty, warranty_terms: e.target.value})}
                  placeholder="What does the warranty cover? Any specific terms or conditions..."
                />
              </div>

              <div>
                <Label htmlFor="proof_of_purchase_url">Proof of Purchase URL (optional)</Label>
                <Input
                  id="proof_of_purchase_url"
                  value={newWarranty.proof_of_purchase_url}
                  onChange={(e) => setNewWarranty({...newWarranty, proof_of_purchase_url: e.target.value})}
                  placeholder="Link to receipt, invoice, or warranty document"
                />
              </div>

              <Button 
                onClick={handleAddWarranty} 
                disabled={!newWarranty.equipment_id || !newWarranty.warranty_start_date || !newWarranty.warranty_end_date}
                className="w-full"
              >
                Add Warranty
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Warranties Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warranties.map((warranty) => {
                const status = getWarrantyStatus(warranty.warranty_end_date);
                return (
                  <TableRow key={warranty.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {warranty.equipment.brand} {warranty.equipment.model}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {warranty.equipment.type}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{warranty.warranty_provider}</TableCell>
                    <TableCell>
                      {new Date(warranty.warranty_start_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(warranty.warranty_end_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.color as any}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {warranty.proof_of_purchase_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(warranty.proof_of_purchase_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteWarranty(warranty.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {warranties.length === 0 && (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Warranty Records</h3>
              <p className="text-muted-foreground">
                Start tracking warranty information for your equipment
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}