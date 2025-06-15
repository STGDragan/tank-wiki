
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Camera, Plus, Skull } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageUploader } from '@/components/aquarium/ImageUploader';

type Livestock = Tables<'livestock'> & { image_url?: string | null };

interface LivestockCardProps {
  livestock: Livestock;
  onUpdateQuantity: (livestockId: string, currentQuantity: number, change: number) => void;
}

export const LivestockCard = ({ livestock, onUpdateQuantity }: LivestockCardProps) => {
  const [isUploaderOpen, setUploaderOpen] = useState(false);
  const imageUrl = livestock.image_url || `https://placehold.co/400x300/3B82F6/FFFFFF?text=${livestock.species.replace(/\s/g, '+')}`;

  return (
    <Dialog open={isUploaderOpen} onOpenChange={setUploaderOpen}>
      <Card className="h-full group">
        <CardHeader>
          <CardTitle>{livestock.species}</CardTitle>
          <CardDescription>{livestock.name || 'No nickname'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <img src={imageUrl} alt={livestock.species} className="rounded-md mb-4 aspect-video object-cover" />
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); onUpdateQuantity(livestock.id, livestock.quantity, 1)}}>
                <Plus />
              </Button>
              <Button variant="destructive" size="icon" onClick={(e) => { e.stopPropagation(); onUpdateQuantity(livestock.id, livestock.quantity, -1)}}>
                <Skull />
              </Button>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Camera />
                  <span className="sr-only">Update image</span>
                </Button>
              </DialogTrigger>
            </div>
          </div>
          <p>Quantity: {livestock.quantity}</p>
          <p className="text-sm text-muted-foreground mt-2">Added on {format(new Date(livestock.added_at), 'PPP')}</p>
        </CardContent>
      </Card>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Image for {livestock.species}</DialogTitle>
        </DialogHeader>
        <ImageUploader 
          aquariumId={livestock.aquarium_id}
          recordId={livestock.id}
          table="livestock"
          onUploadSuccess={() => setUploaderOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
