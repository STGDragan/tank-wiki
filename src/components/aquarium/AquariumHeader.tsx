
import { useAuth } from "@/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { ImageUploader } from "./ImageUploader";
import { ShareAquariumDialog } from "./ShareAquariumDialog";
import { Button } from "../ui/button";
import { Camera } from "lucide-react";
import { TimelineSlideshow } from "./TimelineSlideshow";

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
      {/* Header with aquarium info and compact main image */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side - Aquarium info */}
        <div className="flex-1">
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
        
        {/* Right side - Compact main tank image */}
        <div className="flex-shrink-0 relative">
          {aquarium.image_url ? (
            <div className="relative">
              <div className="w-48 h-32 md:w-56 md:h-36 rounded-lg overflow-hidden bg-muted">
                <img
                  src={aquarium.image_url}
                  alt={`${aquarium.name} main image`}
                  className="object-cover w-full h-full"
                />
              </div>
              {isOwner && (
                <div className="absolute -bottom-2 -right-2">
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
          ) : (
            isOwner && (
              <div className="w-48 h-32 md:w-56 md:h-36 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/20">
                <ImageUploader
                  aquariumId={aquarium.id}
                  onUploadSuccess={handleImageUploadSuccess}
                  table="aquariums"
                  recordId={aquarium.id}
                  aspect={16/9}
                  showAsButton={true}
                />
              </div>
            )
          )}
        </div>
      </div>

      {/* Timeline slideshow - full width */}
      <TimelineSlideshow aquariumId={aquarium.id} />
    </div>
  );
}
