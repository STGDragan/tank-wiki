
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageCropper } from "@/components/aquarium/ImageCropper";

interface ImageCropDialogProps {
  imageToCrop: { file: File; src: string } | null;
  onCrop: (blob: Blob) => void;
  onClose: () => void;
  context?: string;
}

export function ImageCropDialog({ imageToCrop, onCrop, onClose, context = 'landing-page' }: ImageCropDialogProps) {
  // Define optimal aspect ratios and dimensions based on context
  const getContextInfo = () => {
    switch (context) {
      case 'dashboard':
        return { 
          aspectRatio: 6, // 6:1 for dashboard banner
          dimensions: '1200 × 200px',
          description: 'Crop for dashboard banner (6:1 aspect ratio)'
        };
      case 'landing-page':
        return { 
          aspectRatio: 3, // 3:1 for landing page
          dimensions: '1200 × 400px',
          description: 'Crop for landing page slideshow (3:1 aspect ratio)'
        };
      default:
        return { 
          aspectRatio: 3, 
          dimensions: '1200 × 400px',
          description: 'Crop for slideshow (3:1 aspect ratio)'
        };
    }
  };

  const contextInfo = getContextInfo();

  return (
    <Dialog open={!!imageToCrop} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crop Image for Slideshow</DialogTitle>
          <DialogDescription className="space-y-2">
            <div>{contextInfo.description}</div>
            <div className="text-sm font-medium">
              Optimal dimensions: {contextInfo.dimensions}
            </div>
            <div className="text-sm text-muted-foreground">
              Adjust the selection to focus on the most important part of your image. 
              The cropped area will be displayed at full resolution in the slideshow.
            </div>
          </DialogDescription>
        </DialogHeader>
        {imageToCrop && (
          <div className="max-h-[60vh] overflow-hidden">
            <ImageCropper
              src={imageToCrop.src}
              aspect={contextInfo.aspectRatio}
              onCrop={onCrop}
              onCancel={onClose}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
