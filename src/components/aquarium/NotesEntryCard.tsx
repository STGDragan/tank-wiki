
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { format } from 'date-fns';

interface NotesEntryCardProps {
    entry: Tables<'journal_entries'>;
}

export const NotesEntryCard = ({ entry }: NotesEntryCardProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{entry.title}</CardTitle>
                <CardDescription>{format(new Date(entry.entry_date), 'PPP')}</CardDescription>
            </CardHeader>
            {entry.content && (
                <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{entry.content}</p>
                </CardContent>
            )}
        </Card>
    );
};
