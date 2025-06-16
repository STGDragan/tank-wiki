
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { AddNotesEntryForm } from '@/components/aquarium/AddNotesEntryForm';
import { AddMedicationForm } from '@/components/aquarium/AddMedicationForm';
import { NotesEntryCard } from '@/components/aquarium/NotesEntryCard';
import { MedicationCard } from '@/components/aquarium/MedicationCard';
import { PlusCircle, Wrench, Fish, Droplets, FileText, Pill } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useLogEntries } from '@/hooks/useLogEntries';

type Livestock = Tables<'livestock'>;
type Equipment = Tables<'equipment'>;
type WaterParameterReading = Tables<'water_parameters'>;
type MaintenanceTask = Tables<'maintenance'> & { equipment: { type: string, brand: string | null, model: string | null } | null };
type Medication = Tables<'medications'>;

type LogEntry = {
  id: string;
  type: 'maintenance' | 'livestock' | 'water_parameter' | 'equipment' | 'note' | 'medication';
  date: Date;
  title: string;
  description: React.ReactNode;
};

const fetchNotesEntries = async (aquariumId: string) => {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('aquarium_id', aquariumId)
    .order('entry_date', { ascending: false });

  if (error) throw error;
  return data;
};

const fetchMedications = async (aquariumId: string): Promise<Medication[]> => {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('aquarium_id', aquariumId)
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data || [];
};

const getIcon = (type: LogEntry['type']) => {
  switch (type) {
    case 'maintenance':
      return <Wrench className="h-5 w-5 text-blue-500" />;
    case 'livestock':
      return <Fish className="h-5 w-5 text-green-500" />;
    case 'water_parameter':
      return <Droplets className="h-5 w-5 text-cyan-500" />;
    case 'equipment':
      return <Wrench className="h-5 w-5 text-purple-500" />;
    case 'note':
      return <FileText className="h-5 w-5 text-orange-500" />;
    case 'medication':
      return <Pill className="h-5 w-5 text-pink-500" />;
    default:
      return null;
  }
};

const filterOptions: { value: LogEntry['type'] | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'livestock', label: 'Livestock' },
  { value: 'water_parameter', label: 'Water Tests' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'medication', label: 'Medications' },
  { value: 'note', label: 'Notes' },
];

interface JournalTabProps {
  aquariumId: string;
  canEdit: boolean;
  userId: string;
  tasks?: MaintenanceTask[];
  livestock?: Livestock[];
  waterParameters?: WaterParameterReading[];
  equipment?: Equipment[];
  aquariumType?: string | null;
}

export const JournalTab = ({ 
  aquariumId, 
  canEdit, 
  userId,
  tasks,
  livestock,
  waterParameters,
  equipment,
  aquariumType
}: JournalTabProps) => {
  const [activeView, setActiveView] = useState<'notes' | 'medications' | 'log'>('notes');
  const [isAddEntryOpen, setAddEntryOpen] = useState(false);
  const [isAddMedicationOpen, setAddMedicationOpen] = useState(false);
  const [logFilter, setLogFilter] = useState<LogEntry['type'] | 'all'>('all');

  const { data: entries, isLoading: notesLoading, error: notesError } = useQuery<Tables<'journal_entries'>[]>({
    queryKey: ['journal_entries', aquariumId],
    queryFn: () => fetchNotesEntries(aquariumId),
    enabled: !!aquariumId,
  });

  const { data: medications, isLoading: medicationsLoading, error: medicationsError } = useQuery({
    queryKey: ['medications', aquariumId],
    queryFn: () => fetchMedications(aquariumId),
    enabled: !!aquariumId,
  });

  const logEntries = useLogEntries(tasks, livestock, waterParameters, equipment, entries, aquariumType, medications);

  const filteredLogEntries = logFilter === 'all'
    ? logEntries
    : logEntries.filter((entry) => entry.type === logFilter);

  return (
    <div className="mt-2 space-y-4">
      {/* Internal Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2">
          <Button
            variant={activeView === 'notes' ? 'default' : 'outline'}
            onClick={() => setActiveView('notes')}
          >
            Notes
          </Button>
          <Button
            variant={activeView === 'medications' ? 'default' : 'outline'}
            onClick={() => setActiveView('medications')}
          >
            Medications
          </Button>
          <Button
            variant={activeView === 'log' ? 'default' : 'outline'}
            onClick={() => setActiveView('log')}
          >
            Log
          </Button>
        </div>

        {canEdit && (
          <>
            {activeView === 'notes' && (
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

            {activeView === 'medications' && (
              <Drawer open={isAddMedicationOpen} onOpenChange={setAddMedicationOpen}>
                <DrawerTrigger asChild>
                  <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Medication</Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader><DrawerTitle>Add New Medication</DrawerTitle></DrawerHeader>
                  <div className="px-4 pb-4 max-h-[80vh] overflow-y-auto">
                    <AddMedicationForm aquariumId={aquariumId} onSuccess={() => setAddMedicationOpen(false)} />
                  </div>
                </DrawerContent>
              </Drawer>
            )}
          </>
        )}
      </div>

      {/* Notes View */}
      {activeView === 'notes' && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Notes</h3>
          </div>

          {notesLoading && (
            <div className="space-y-4">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          )}

          {notesError && <p className="text-destructive">Error loading notes: {notesError.message}</p>}

          {!notesLoading && !notesError && (
            <>
              {entries && entries.length > 0 ? (
                <div className="space-y-4">
                  {entries.map(entry => (
                    <NotesEntryCard key={entry.id} entry={entry} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground font-semibold">No notes yet.</p>
                  <p className="text-sm text-muted-foreground mt-1">Add your first note to start tracking your aquarium's history.</p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Medications View */}
      {activeView === 'medications' && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Medications</h3>
          </div>

          {medicationsLoading && (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}

          {medicationsError && <p className="text-destructive">Error loading medications: {medicationsError.message}</p>}

          {!medicationsLoading && !medicationsError && (
            <>
              {medications && medications.length > 0 ? (
                <div className="space-y-4">
                  {medications.map(medication => (
                    <MedicationCard key={medication.id} medication={medication} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground font-semibold">No medications yet.</p>
                  <p className="text-sm text-muted-foreground mt-1">Add your first medication to start tracking treatments.</p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Log View */}
      {activeView === 'log' && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Activity Log</h3>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={logFilter === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLogFilter(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {logEntries.length === 0 ? (
            <p className="text-muted-foreground mt-4">No log entries yet. This log will show completed maintenance, livestock additions, water tests, medications, and notes.</p>
          ) : filteredLogEntries.length === 0 ? (
            <p className="text-muted-foreground mt-4 text-center">No entries found for this filter.</p>
          ) : (
            <div className="space-y-6">
              {filteredLogEntries.map((entry) => (
                <div key={entry.id} className="flex items-start space-x-4 relative before:absolute before:left-4 before:top-8 before:h-full before:w-px before:bg-muted last:before:h-0">
                  <div className="flex-shrink-0 pt-1 z-10">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background ring-8 ring-background">
                      {getIcon(entry.type)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-foreground">{entry.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(entry.date, 'PPp')}
                      </p>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {entry.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
