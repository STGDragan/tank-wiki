
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { AddNotesEntryForm } from '@/components/aquarium/AddNotesEntryForm';
import { NotesEntryCard } from '@/components/aquarium/NotesEntryCard';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const fetchNotesEntries = async (aquariumId: string) => {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('aquarium_id', aquariumId)
    .order('entry_date', { ascending: false });

  if (error) throw error;
  return data;
};

interface NotesTabProps {
  aquariumId: string;
  canEdit: boolean;
}

const NotesTab = ({ aquariumId, canEdit }: NotesTabProps) => {
  const [isAddEntryOpen, setAddEntryOpen] = useState(false);

  const { data: entries, isLoading, error } = useQuery<Tables<'journal_entries'>[]>({
    queryKey: ['journal_entries', aquariumId],
    queryFn: () => fetchNotesEntries(aquariumId),
    enabled: !!aquariumId,
  });

  return (
    <div className="mt-2 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Notes</h3>
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
              <p className="text-muted-foreground font-semibold">No notes yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Add your first note to start tracking your aquarium's history.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotesTab;
