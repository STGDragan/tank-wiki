
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
import { AddWaterParameterForm } from "./AddWaterParameterForm";

type WaterParameterReading = Tables<'water_parameters'>;

const fetchWaterParameters = async (aquariumId: string): Promise<WaterParameterReading[]> => {
  const { data, error } = await supabase
    .from("water_parameters")
    .select("*")
    .eq("aquarium_id", aquariumId)
    .order("recorded_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

const WaterParametersTab = ({ aquariumId, aquariumType }: { aquariumId: string, aquariumType: string | null }) => {
  const [isAddDrawerOpen, setAddDrawerOpen] = useState(false);
  const { data: readings, isLoading, error } = useQuery({
    queryKey: ['water_parameters', aquariumId],
    queryFn: () => fetchWaterParameters(aquariumId),
  });

  const isSaltwater = aquariumType === 'saltwater';
  
  const commonHeaders = ["Date", "Temp", "pH", "Ammonia", "Nitrite", "Nitrate"];
  const saltwaterHeaders = ["Salinity", "Alkalinity", "Calcium", "Magnesium"];
  const tableHeaders = isSaltwater ? [...commonHeaders, ...saltwaterHeaders] : commonHeaders;


  if (isLoading) {
    return (
      <div className="mt-2 p-8 border rounded-lg bg-card">
        <h2 className="text-lg font-semibold mb-4">Water Parameters</h2>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return <div>Error loading water parameters: {error.message}</div>;
  }

  return (
    <div className="mt-2 p-8 border rounded-lg bg-card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Water Parameters</h2>
        <Drawer open={isAddDrawerOpen} onOpenChange={setAddDrawerOpen}>
          <DrawerTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Reading
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Add New Water Parameter Reading</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4 max-h-[80vh] overflow-y-auto">
              <AddWaterParameterForm aquariumId={aquariumId} aquariumType={aquariumType} onSuccess={() => setAddDrawerOpen(false)} />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
      {readings && readings.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                {tableHeaders.map(header => <TableHead key={header}>{header}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {readings.map((reading) => (
                <TableRow key={reading.id}>
                  <TableCell>{format(new Date(reading.recorded_at), 'P')}</TableCell>
                  <TableCell>{reading.temperature ?? 'N/A'}</TableCell>
                  <TableCell>{reading.ph ?? 'N/A'}</TableCell>
                  <TableCell>{reading.ammonia ?? 'N/A'}</TableCell>
                  <TableCell>{reading.nitrite ?? 'N/A'}</TableCell>
                  <TableCell>{reading.nitrate ?? 'N/A'}</TableCell>
                  {isSaltwater && (
                    <>
                      <TableCell>{reading.salinity ?? 'N/A'}</TableCell>
                      <TableCell>{reading.alkalinity ?? 'N/A'}</TableCell>
                      <TableCell>{reading.calcium ?? 'N/A'}</TableCell>
                      <TableCell>{reading.magnesium ?? 'N/A'}</TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : (
        <div className="text-center py-8">
            <p className="text-muted-foreground">No water parameter readings have been added yet.</p>
        </div>
      )}
    </div>
  );
};

export default WaterParametersTab;
