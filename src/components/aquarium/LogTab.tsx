
import { ActivityLogTimeline } from "./ActivityLogTimeline";
import { useLogEntries } from "@/hooks/useLogEntries";
import { Tables } from "@/integrations/supabase/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { AddNotesEntryForm } from '@/components/aquarium/AddNotesEntryForm';
import { NotesEntryCard } from '@/components/aquarium/NotesEntryCard';
import { PlusCircle, Calendar, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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

const fetchNotesEntries = async (aquariumId: string) => {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('aquarium_id', aquariumId)
    .order('entry_date', { ascending: false });

  if (error) throw error;
  return data;
};

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
  const [isAddEntryOpen, setAddEntryOpen] = useState(false);
  
  const legacyEntries = useLogEntries(
    tasks,
    livestock,
    waterParameters,
    equipment,
    journalEntries,
    aquariumType,
    medications
  );

  const { data: entries, isLoading, error } = useQuery<Tables<'journal_entries'>[]>({
    queryKey: ['journal_entries', aquariumId],
    queryFn: () => fetchNotesEntries(aquariumId),
    enabled: !!aquariumId,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Journal & Activity Log</h2>
        <p className="text-muted-foreground">
          Complete timeline of all aquarium activities, notes, and changes
        </p>
      </div>

      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
          <TabsTrigger value="journal">Journal Notes</TabsTrigger>
          <TabsTrigger value="legacy">Legacy Entries</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <ActivityLogTimeline aquariumId={aquariumId} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="journal" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Journal Notes
                  </CardTitle>
                  <CardDescription>
                    Personal notes and observations about your aquarium
                  </CardDescription>
                </div>
                {canEdit && (
                  <Drawer open={isAddEntryOpen} onOpenChange={setAddEntryOpen}>
                    <DrawerTrigger asChild>
                      <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Note</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader><DrawerTitle>Add New Note</DrawerTitle></DrawerHeader>
                      <div className="px-4 pb-4 max-h-[80vh] overflow-y-auto">
                        <AddNotesEntryForm aquariumId={aquariumId} onSuccess={() => setAddEntryOpen(false)} />
                      </div>
                    </DrawerContent>
                  </Drawer>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="space-y-4">
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                </div>
              )}

              {error && <p className="text-destructive">Error loading notes: {error.message}</p>}

              {!isLoading && !error && (
                <>
                  {entries && entries.length > 0 ? (
                    <div className="space-y-4">
                      {entries.map(entry => (
                        <NotesEntryCard key={entry.id} entry={entry} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground font-semibold">No notes yet.</p>
                      <p className="text-sm text-muted-foreground mt-1">Add your first note to start tracking your aquarium's history.</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Legacy Activity Log
              </CardTitle>
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
