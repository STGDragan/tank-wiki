
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
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>{livestock.species}</CardTitle>
          <CardDescription>{livestock.name || 'No nickname'}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow justify-between">
          <div>
            <div className="relative mb-4">
              <img src={imageUrl} alt={livestock.species} className="rounded-md aspect-video object-cover" />
              <div className="absolute top-2 right-2">
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Camera className="h-4 w-4" />
                    <span className="sr-only">Update image</span>
                  </Button>
                </DialogTrigger>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Quantity: {livestock.quantity}</p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onUpdateQuantity(livestock.id, livestock.quantity, 1)}}>
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onUpdateQuantity(livestock.id, livestock.quantity, -1)}}>
                  <Skull className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">Added on {format(new Date(livestock.added_at), 'PPP')}</p>
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
