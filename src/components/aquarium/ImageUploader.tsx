
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  aquariumId: string;
  onUploadSuccess: () => void;
  table: 'aquariums' | 'livestock' | 'equipment';
  recordId: string;
}

export const ImageUploader = ({ aquariumId, onUploadSuccess, table, recordId }: ImageUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${recordId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('aquarium_images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('aquarium_images')
        .getPublicUrl(filePath);

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
    onSuccess: () => {
      toast({ title: 'Image uploaded successfully!' });
      if (table === 'aquariums') {
          queryClient.invalidateQueries({ queryKey: ['aquarium', recordId] });
          queryClient.invalidateQueries({ queryKey: ['aquariums'] });
      } else {
          queryClient.invalidateQueries({ queryKey: [table, aquariumId] });
      }
      onUploadSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
        setUploading(false);
        setFile(null);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <Input type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
        <Button type="submit" disabled={!file || isUploading} className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Upload Image'}
        </Button>
    </form>
  );
};
