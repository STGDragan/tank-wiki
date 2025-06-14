
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { Tables } from "@/integrations/supabase/types";

type Livestock = Tables<'livestock'>;

const fetchLivestock = async (aquariumId: string): Promise<Livestock[]> => {
  const { data, error } = await supabase
    .from("livestock")
    .select("*")
    .eq("aquarium_id", aquariumId)
    .order("added_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

const LivestockTab = ({ aquariumId }: { aquariumId: string }) => {
  const { data: livestock, isLoading, error } = useQuery({
    queryKey: ['livestock', aquariumId],
    queryFn: () => fetchLivestock(aquariumId),
  });

  if (isLoading) {
    return (
      <div className="mt-2 p-8 border rounded-lg bg-card">
        <h2 className="text-lg font-semibold mb-4">Livestock</h2>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return <div>Error loading livestock: {error.message}</div>;
  }

  return (
    <div className="mt-2 p-8 border rounded-lg bg-card">
      <h2 className="text-lg font-semibold mb-4">Livestock</h2>
      {livestock && livestock.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Species</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {livestock.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.species}</TableCell>
                <TableCell>{item.name || 'N/A'}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{format(new Date(item.added_at), 'PPP')}</TableCell>
                <TableCell>{item.notes || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8">
            <p className="text-muted-foreground">No livestock have been added to this aquarium yet.</p>
        </div>
      )}
    </div>
  );
};

export default LivestockTab;
