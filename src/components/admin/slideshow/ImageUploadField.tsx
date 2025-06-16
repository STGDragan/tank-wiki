
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRef } from "react";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface ImageUploadFieldProps {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedFile: File | undefined;
  isDisabled: boolean;
  error?: string;
  context?: string;
}

export function ImageUploadField({ onFileSelect, selectedFile, isDisabled, error, context = 'landing-page' }: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getOptimalDimensions = () => {
    switch (context) {
      case 'dashboard':
        return '1200 × 200px (6:1 aspect ratio)';
      case 'landing-page':
        return '1200 × 400px (3:1 aspect ratio)';
      default:
        return '1200 × 400px (3:1 aspect ratio)';
    }
  };

  return (
    <FormItem>
      <FormLabel>Image</FormLabel>
      <FormControl>
        <Input
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          ref={fileInputRef}
          onChange={onFileSelect}
          disabled={isDisabled}
        />
      </FormControl>
      <FormDescription className="space-y-1">
        <div>Upload an image from your computer (max 5MB).</div>
        <div className="font-medium text-sm">
          For best results, use images with dimensions: {getOptimalDimensions()}
        </div>
        <div className="text-sm text-muted-foreground">
          Images will be cropped to the correct aspect ratio during upload.
        </div>
      </FormDescription>
      {selectedFile && (
        <div className="mt-2 p-2 border rounded-md">
          <p className="text-sm font-medium mb-2">Cropped image preview:</p>
          <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="rounded-md max-h-40 object-contain" />
        </div>
      )}
      <FormMessage>{error}</FormMessage>
    </FormItem>
  );
}
