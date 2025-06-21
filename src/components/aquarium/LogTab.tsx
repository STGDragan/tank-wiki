
import { ActivityLogTimeline } from "./ActivityLogTimeline";
import { useLogEntries } from "@/hooks/useLogEntries";
import { Tables } from "@/integrations/supabase/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

type Livestock = Tables<'livestock'>;
type Equipment = Tables<'equipment'>;
type WaterParameterReading = Tables<'water_parameters'>;
type MaintenanceTask = Tables<'maintenance'> & { equipment: { type: string, brand: string | null, model: string | null } | null };
type JournalEntry = Tables<'journal_entries'>;
type Medication = Tables<'medications'>;

interface LogTabProps {
  aquariumId: string;
  canEdit?: boolean;
  userId: string;
  tasks?: MaintenanceTask[];
  livestock?: Livestock[];
  waterParameters?: WaterParameterReading[];
  equipment?: Equipment[];
  journalEntries?: JournalEntry[];
  aquariumType?: string | null;
  medications?: Medication[];
}

export function LogTab({
  aquariumId,
  canEdit = true,
  userId,
  tasks,
  livestock,
  waterParameters,
  equipment,
  journalEntries,
  aquariumType,
  medications,
}: LogTabProps) {
  const legacyEntries = useLogEntries(
    tasks,
    livestock,
    waterParameters,
    equipment,
    journalEntries,
    aquariumType,
    medications
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Activity Log</h2>
        <p className="text-muted-foreground">
          Complete timeline of all aquarium activities and changes
        </p>
      </div>

      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
          <TabsTrigger value="legacy">Legacy Entries</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <ActivityLogTimeline aquariumId={aquariumId} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="legacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Legacy Activity Log</CardTitle>
              <CardDescription>
                Historical entries from before the new activity logging system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {legacyEntries.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No legacy entries found.
                </p>
              ) : (
                <div className="space-y-4">
                  {legacyEntries.map((entry) => (
                    <div key={entry.id} className="border-l-2 border-primary/20 pl-4 pb-4 last:pb-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{entry.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {format(entry.date, 'MMM d, yyyy at h:mm a')}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {entry.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
