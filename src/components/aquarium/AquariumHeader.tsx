import { useState } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ImageUploader } from '@/components/aquarium/ImageUploader';

type Aquarium = Tables<'aquariums'> & { image_url?: string | null };

interface AquariumHeaderProps {
  aquarium: Aquarium;
}

export const AquariumHeader = ({ aquarium }: AquariumHeaderProps) => {
  const [isImagePopoverOpen, setImagePopoverOpen] = useState(false);

  return (
    <div className="relative rounded-lg overflow-hidden">
      <img
        src={aquarium.image_url || `https://placehold.co/1200x400/34D399/FFFFFF?text=${encodeURIComponent(aquarium.name)}`}
        alt={aquarium.name}
        className="w-full h-48 md:h-64 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute bottom-0 left-0 p-4 md:p-6">
        <h1 className="text-2xl md:text-4xl font-bold text-white shadow-lg">{aquarium.name}</h1>
        <p className="text-lg text-gray-200 mt-1 shadow-md">
          {aquarium.type} - {aquarium.size} Gallons
        </p>
      </div>
      <div className="absolute top-4 right-4">
        <Popover open={isImagePopoverOpen} onOpenChange={setImagePopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="secondary" size="icon">
              <Camera className="h-5 w-5" />
              <span className="sr-only">Change Image</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-medium leading-none">Tank Image</h4>
                <p className="text-sm text-muted-foreground">Upload a new main image for your tank.</p>
              </div>
              <ImageUploader
                aquariumId={aquarium.id}
                onUploadSuccess={() => setImagePopoverOpen(false)}
                table="aquariums"
                recordId={aquarium.id}
                aspect={3}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
