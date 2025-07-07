import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { Plus, X } from "lucide-react";

interface ProductImageManagerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

export const ProductImageManager = ({ images, onImagesChange }: ProductImageManagerProps) => {
  const [newImage, setNewImage] = useState("");

  const addImage = () => {
    if (newImage.trim() && !images.includes(newImage.trim())) {
      onImagesChange([...images, newImage.trim()]);
      setNewImage("");
    }
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <FormLabel>Images</FormLabel>
        <div className="flex gap-2">
          <Input
            placeholder="Enter image URL"
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
          />
          <Button type="button" onClick={addImage} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {images.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Product Images</label>
          <div className="grid grid-cols-2 gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img 
                  src={image} 
                  alt={`Product image ${index + 1}`}
                  className="w-full h-24 object-cover rounded border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};