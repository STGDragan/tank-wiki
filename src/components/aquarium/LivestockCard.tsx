
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { format } from 'date-fns';

type Livestock = Tables<'livestock'> & { image_url?: string | null };

export const LivestockCard = ({ livestock }: { livestock: Livestock }) => {
  const imageUrl = livestock.image_url || `https://placehold.co/400x300/3B82F6/FFFFFF?text=${livestock.species.replace(/\s/g, '+')}`;
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{livestock.species}</CardTitle>
        <CardDescription>{livestock.name || 'No nickname'}</CardDescription>
      </CardHeader>
      <CardContent>
        <img src={imageUrl} alt={livestock.species} className="rounded-md mb-4 aspect-video object-cover" />
        <p>Quantity: {livestock.quantity}</p>
        <p className="text-sm text-muted-foreground mt-2">Added on {format(new Date(livestock.added_at), 'PPP')}</p>
      </CardContent>
    </Card>
  );
};
