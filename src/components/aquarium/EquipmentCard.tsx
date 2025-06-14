
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { format } from 'date-fns';

type Equipment = Tables<'equipment'> & { image_url?: string | null };

export const EquipmentCard = ({ equipment }: { equipment: Equipment }) => {
  const imageUrl = equipment.image_url || `https://placehold.co/400x300/10B981/FFFFFF?text=${equipment.type.replace(/\s/g, '+')}`;
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{equipment.type}</CardTitle>
        <CardDescription>{equipment.brand} {equipment.model}</CardDescription>
      </CardHeader>
      <CardContent>
        <img src={imageUrl} alt={equipment.type} className="rounded-md mb-4 aspect-video object-cover" />
        {equipment.installed_at && <p className="text-sm text-muted-foreground">Installed on {format(new Date(equipment.installed_at), 'PPP')}</p>}
      </CardContent>
    </Card>
  );
};
