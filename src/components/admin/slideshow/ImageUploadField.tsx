
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRef } from "react";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface ImageUploadFieldProps {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedFile: File | undefined;
  isDisabled: boolean;
  error?: string;
}

export function ImageUploadField({ onFileSelect, selectedFile, isDisabled, error }: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      <FormDescription>
        Upload an image from your computer (max 5MB). It will be cropped to a 3:2 aspect ratio.
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
