
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { Tables } from "@/integrations/supabase/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { AddEquipmentForm } from "./AddEquipmentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const fetchEquipment = async (aquariumId: string) => {
  const { data, error } = await supabase
    .from("equipment")
    .select("*")
    .eq("aquarium_id", aquariumId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Tables<'equipment'>[]) || [];
};

const EquipmentTab = ({ aquariumId }: { aquariumId: string }) => {
  const [isAddDrawerOpen, setAddDrawerOpen] = useState(false);
  const { data: equipment, isLoading, error } = useQuery({
    queryKey: ['equipment', aquariumId],
    queryFn: () => fetchEquipment(aquariumId),
  });

  if (isLoading) {
    return (
      <Card className="mt-2">
        <CardHeader>
          <CardTitle>Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <div>Error loading equipment: {error.message}</div>;
  }

  return (
    <Card className="mt-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Equipment</CardTitle>
        <Drawer open={isAddDrawerOpen} onOpenChange={setAddDrawerOpen}>
          <DrawerTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Equipment
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Add New Equipment</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4 max-h-[80vh] overflow-y-auto">
              <AddEquipmentForm aquariumId={aquariumId} onSuccess={() => setAddDrawerOpen(false)} />
            </div>
          </DrawerContent>
        </Drawer>
      </CardHeader>
      <CardContent>
        {equipment && equipment.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Installed</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.brand ?? 'N/A'}</TableCell>
                  <TableCell>{item.model ?? 'N/A'}</TableCell>
                  <TableCell>{item.installed_at ? format(new Date(item.installed_at), 'P') : 'N/A'}</TableCell>
                  <TableCell>{item.notes ?? 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No equipment has been added yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentTab;
