
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageCropper } from "@/components/aquarium/ImageCropper";

interface ImageCropDialogProps {
  imageToCrop: { file: File; src: string } | null;
  onCrop: (blob: Blob) => void;
  onClose: () => void;
}

export function ImageCropDialog({ imageToCrop, onCrop, onClose }: ImageCropDialogProps) {
  return (
    <Dialog open={!!imageToCrop} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
          <DialogDescription>Adjust the selection for the slideshow image. The aspect ratio is 3:2.</DialogDescription>
        </DialogHeader>
        {imageToCrop && (
          <ImageCropper
            src={imageToCrop.src}
            aspect={3 / 2}
            onCrop={onCrop}
            onCancel={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
