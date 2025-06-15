
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageUploader } from '@/components/aquarium/ImageUploader';

type Livestock = Tables<'livestock'> & { image_url?: string | null };

export const LivestockCard = ({ livestock }: { livestock: Livestock }) => {
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
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-4 w-4" />
                <span className="sr-only">Update image</span>
              </Button>
            </DialogTrigger>
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
