
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ImageCropper } from './ImageCropper';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Camera } from 'lucide-react';

interface ImageUploaderProps {
  aquariumId: string;
  onUploadSuccess: (imageUrl?: string) => void;
  table: 'aquariums' | 'livestock' | 'equipment' | 'aquarium_timeline';
  recordId: string;
  aspect: number;
  showAsButton?: boolean;
}

export const ImageUploader = ({ aquariumId, onUploadSuccess, table, recordId, aspect, showAsButton = false }: ImageUploaderProps) => {
  const [imageToCrop, setImageToCrop] = useState<{file: File, src: string} | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop({ file, src: reader.result as string });
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async ({ image, originalFile }: { image: Blob, originalFile: File }) => {
      const fileExt = originalFile.name.split('.').pop() || 'jpg';
      const fileName = `${recordId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('aquarium_images')
        .upload(filePath, image, { upsert: true, contentType: image.type });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('aquarium_images')
        .getPublicUrl(filePath);

      // For timeline entries, we don't update the database record here
      // The form will handle setting the image_url when submitting
      if (table === 'aquarium_timeline') {
        return publicUrl;
      }

      const { error: dbError } = await supabase
        .from(table)
        .update({ image_url: publicUrl })
        .eq('id', recordId);

      if (dbError) {
        await supabase.storage.from('aquarium_images').remove([filePath]);
        throw new Error(`Database update failed: ${dbError.message}`);
      }

      return publicUrl;
    },
    onSuccess: (imageUrl) => {
      toast({ title: 'Image uploaded successfully!' });
      if (table === 'aquariums') {
          queryClient.invalidateQueries({ queryKey: ['aquarium', recordId] });
          queryClient.invalidateQueries({ queryKey: ['aquariums'] });
      } else if (table !== 'aquarium_timeline') {
          queryClient.invalidateQueries({ queryKey: [table, aquariumId] });
      }
      onUploadSuccess(imageUrl);
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
        setImageToCrop(null);
    }
  });

  const onCrop = (croppedBlob: Blob) => {
    uploadMutation.mutate({ image: croppedBlob, originalFile: imageToCrop!.file });
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  if (showAsButton) {
    return (
      <>
        <Dialog open={!!imageToCrop} onOpenChange={(open) => !open && !uploadMutation.isPending && setImageToCrop(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Crop Image</DialogTitle>
              <DialogDescription>Adjust the selection to crop the image.</DialogDescription>
            </DialogHeader>
            {imageToCrop && (
              <ImageCropper
                src={imageToCrop.src}
                aspect={aspect}
                onCrop={onCrop}
                onCancel={() => setImageToCrop(null)}
              />
            )}
          </DialogContent>
        </Dialog>
        <Input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          disabled={uploadMutation.isPending} 
          ref={fileInputRef}
          className="hidden"
        />
        <Button 
          onClick={handleButtonClick} 
          disabled={uploadMutation.isPending}
          className="bg-black/50 hover:bg-black/70 text-white"
        >
          {uploadMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Camera className="mr-2 h-4 w-4" />
          )}
          {uploadMutation.isPending ? 'Uploading...' : 'Change Image'}
        </Button>
      </>
    );
  }

  return (
    <>
      <Dialog open={!!imageToCrop} onOpenChange={(open) => !open && !uploadMutation.isPending && setImageToCrop(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
            <DialogDescription>Adjust the selection to crop the image.</DialogDescription>
          </DialogHeader>
          {imageToCrop && (
            <ImageCropper
              src={imageToCrop.src}
              aspect={aspect}
              onCrop={onCrop}
              onCancel={() => setImageToCrop(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      <div className="space-y-4">
        <Input type="file" accept="image/*" onChange={handleFileChange} disabled={uploadMutation.isPending} ref={fileInputRef} />
        {uploadMutation.isPending && 
            <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
            </div>
        }
      </div>
    </>
  );
};
