
import { useAuth } from "@/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const isOwner = user?.id === aquarium.user_id;

  const handleImageUploadSuccess = () => {
    console.log('Image upload success callback triggered');
    console.log('Invalidating queries for aquarium:', aquarium.id);
    
    // Invalidate and refetch the aquarium data to show the new image
    queryClient.invalidateQueries({ queryKey: ['aquarium', aquarium.id] });
    
    // Also invalidate any other related queries that might cache aquarium data
    queryClient.invalidateQueries({ queryKey: ['aquariums'] });
    
    // Force a refetch of the specific aquarium
    queryClient.refetchQueries({ queryKey: ['aquarium', aquarium.id] });
  };

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
      
      {/* Only render the image section if there's an image OR if user is owner (to show upload option) */}
      {aquarium.image_url && (
        <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg">
          <div className="relative w-full h-full">
            <img
              src={aquarium.image_url}
              alt={aquarium.name}
              className="object-cover w-full h-full"
            />
            {isOwner && (
              <div className="absolute bottom-4 right-4">
                <ImageUploader
                  aquariumId={aquarium.id}
                  onUploadSuccess={handleImageUploadSuccess}
                  table="aquariums"
                  recordId={aquarium.id}
                  aspect={16/9}
                  showAsButton={true}
                />
              </div>
            )}
          </div>
        </AspectRatio>
      )}

      {/* Show upload option only when no image exists and user is owner */}
      {!aquarium.image_url && isOwner && (
        <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg">
          <ImageUploader
            aquariumId={aquarium.id}
            onUploadSuccess={handleImageUploadSuccess}
            table="aquariums"
            recordId={aquarium.id}
            aspect={16/9}
          />
        </AspectRatio>
      )}
    </div>
  );
}
