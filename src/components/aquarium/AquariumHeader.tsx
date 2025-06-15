
import { useAuth } from "@/providers/AuthProvider";
import { AspectRatio } from "../ui/aspect-ratio";
import { ImageUploader } from "./ImageUploader";
import { ShareAquariumDialog } from "./ShareAquariumDialog";

interface AquariumHeaderProps {
  aquarium: {
    id: string;
    name: string;
    type: string | null;
    size: number | null;
    image_url: string | null;
    user_id: string;
  };
}

export function AquariumHeader({ aquarium }: AquariumHeaderProps) {
  const { user } = useAuth();
  const isOwner = user?.id === aquarium.user_id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{aquarium.name}</h1>
            {isOwner && (
              <ShareAquariumDialog aquariumId={aquarium.id} aquariumName={aquarium.name} />
            )}
          </div>
          <div className="flex gap-4 text-muted-foreground">
            {aquarium.type && (
              <span className="capitalize">{aquarium.type}</span>
            )}
            {aquarium.size && (
              <span>{aquarium.size} gallons</span>
            )}
          </div>
        </div>
      </div>
      
      <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg">
        {isOwner ? (
          <ImageUploader
            aquariumId={aquarium.id}
            currentImageUrl={aquarium.image_url}
            className="w-full h-full"
          />
        ) : (
          <img
            src={aquarium.image_url || '/placeholder.svg'}
            alt={aquarium.name}
            className="object-cover w-full h-full"
          />
        )}
      </AspectRatio>
    </div>
  );
}
