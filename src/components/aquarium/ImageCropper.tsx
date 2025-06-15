
import { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Crop } from 'lucide-react';

interface ImageCropperProps {
  src: string;
  aspect: number;
  onCrop: (blob: Blob) => void;
  onCancel: () => void;
}

function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = Math.floor(crop.width * scaleX);
    canvas.height = Math.floor(crop.height * scaleY);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return Promise.reject(new Error('Canvas context not available'));
    }

    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
    );
    
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                resolve(blob);
            },
            'image/jpeg',
            0.95
        );
    });
}

export const ImageCropper = ({ src, aspect, onCrop, onCancel }: ImageCropperProps) => {
  const [crop, setCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        width,
        height
      ),
      width,
      height
    );
    setCrop(newCrop);
    setCompletedCrop(newCrop);
  }

  const handleCrop = async () => {
    if (completedCrop && imgRef.current) {
        try {
            const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
            onCrop(croppedImageBlob);
        } catch (e) {
            console.error('Cropping failed: ', e);
        }
    }
  };

  return (
    <div className="space-y-4">
        <div className="flex justify-center p-4 bg-muted rounded-lg">
            <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={c => setCompletedCrop(c)}
                aspect={aspect}
                className="max-h-[60vh]"
            >
                <img ref={imgRef} src={src} onLoad={onImageLoad} alt="Crop preview" style={{ maxHeight: '60vh' }} />
            </ReactCrop>
        </div>
        <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={handleCrop} disabled={!completedCrop?.width || !completedCrop?.height}>
                <Crop className="mr-2 h-4 w-4" />
                Crop and Use Image
            </Button>
        </div>
    </div>
  );
};
