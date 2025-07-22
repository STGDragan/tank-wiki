import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Star, Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface MaintenanceSuppliersProps {
  userId: string;
}

export function MaintenanceSuppliers({ userId }: MaintenanceSuppliersProps) {
  const [suppliers, setSuppliers] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [newSupplier, setNewSupplier] = useState({
    supplier_name: "",
    contact_email: "",
    contact_phone: "",
    website_url: "",
    specialties: "",
    notes: ""
  });

  useEffect(() => {
    loadSuppliers();
  }, [userId]);

  const loadSuppliers = async () => {
    try {
      const { data } = await supabase
        .from('maintenance_suppliers')
        .select('*')
        .eq('user_id', userId)
        .order('supplier_name');
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = async () => {
    try {
      const { error } = await supabase.from('maintenance_suppliers').insert({
        user_id: userId,
        supplier_name: newSupplier.supplier_name,
        contact_email: newSupplier.contact_email,
        contact_phone: newSupplier.contact_phone,
        website_url: newSupplier.website_url,
        specialties: newSupplier.specialties.split(',').map(s => s.trim()).filter(Boolean),
        notes: newSupplier.notes
      });

      if (error) throw error;

      toast({
        title: "Supplier Added",
        description: "Maintenance supplier has been added successfully",
      });

      setNewSupplier({
        supplier_name: "",
        contact_email: "",
        contact_phone: "",
        website_url: "",
        specialties: "",
        notes: ""
      });
      setIsAddDialogOpen(false);
      loadSuppliers();
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast({
        title: "Error",
        description: "Failed to add supplier",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-4">Loading suppliers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Maintenance Suppliers
          </h3>
          <p className="text-sm text-muted-foreground">
            Keep track of your preferred suppliers and vendors
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Maintenance Supplier</DialogTitle>
              <DialogDescription>
                Add a new supplier or vendor for maintenance supplies
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="supplier_name">Supplier Name *</Label>
                <Input
                  id="supplier_name"
                  value={newSupplier.supplier_name}
                  onChange={(e) => setNewSupplier({...newSupplier, supplier_name: e.target.value})}
                  placeholder="Company or store name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email">Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={newSupplier.contact_email}
                    onChange={(e) => setNewSupplier({...newSupplier, contact_email: e.target.value})}
                    placeholder="contact@supplier.com"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Phone</Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    value={newSupplier.contact_phone}
                    onChange={(e) => setNewSupplier({...newSupplier, contact_phone: e.target.value})}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website_url">Website</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={newSupplier.website_url}
                  onChange={(e) => setNewSupplier({...newSupplier, website_url: e.target.value})}
                  placeholder="https://supplier.com"
                />
              </div>

              <div>
                <Label htmlFor="specialties">Specialties</Label>
                <Input
                  id="specialties"
                  value={newSupplier.specialties}
                  onChange={(e) => setNewSupplier({...newSupplier, specialties: e.target.value})}
                  placeholder="filters, lighting, pumps (comma separated)"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newSupplier.notes}
                  onChange={(e) => setNewSupplier({...newSupplier, notes: e.target.value})}
                  placeholder="Any additional notes about this supplier..."
                />
              </div>

              <Button 
                onClick={handleAddSupplier} 
                disabled={!newSupplier.supplier_name}
                className="w-full"
              >
                Add Supplier
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {suppliers.map((supplier: any) => (
          <Card key={supplier.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {supplier.supplier_name}
                    {supplier.preferred_supplier && (
                      <Badge variant="secondary">
                        <Star className="h-3 w-3 mr-1" />
                        Preferred
                      </Badge>
                    )}
                  </CardTitle>
                  {supplier.specialties && supplier.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {supplier.specialties.map((specialty: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {supplier.contact_email && (
                  <p className="text-sm">
                    <strong>Email:</strong> {supplier.contact_email}
                  </p>
                )}
                {supplier.contact_phone && (
                  <p className="text-sm">
                    <strong>Phone:</strong> {supplier.contact_phone}
                  </p>
                )}
                {supplier.website_url && (
                  <p className="text-sm">
                    <strong>Website:</strong> 
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => window.open(supplier.website_url, '_blank')}
                      className="p-0 h-auto ml-1"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Visit Site
                    </Button>
                  </p>
                )}
                {supplier.notes && (
                  <p className="text-sm text-muted-foreground">
                    {supplier.notes}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {suppliers.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Suppliers Added</h3>
              <p className="text-muted-foreground">
                Add suppliers to keep track of where you purchase maintenance supplies
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}