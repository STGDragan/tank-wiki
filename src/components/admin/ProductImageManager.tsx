
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Star, Image as ImageIcon } from "lucide-react";

interface ProductImageManagerProps {
  product: Tables<'products'> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductImageManager = ({ product, open, onOpenChange }: ProductImageManagerProps) => {
  const [imageUrls, setImageUrls] = useState<string[]>(() => {
    if (!product) return [""];
    return product.images || [product.image_url].filter(Boolean) || [""];
  });
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProductMutation = useMutation({
    mutationFn: async (updates: Partial<Tables<'products'>>) => {
      if (!product) throw new Error("No product selected");
      
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', product.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Images Updated', description: 'Product images have been updated successfully.' });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating images', description: error.message, variant: 'destructive' });
    }
  });

  const addImageUrl = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const removeImageUrl = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    if (primaryImageIndex >= newUrls.length) {
      setPrimaryImageIndex(Math.max(0, newUrls.length - 1));
    }
  };

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const setPrimaryImage = (index: number) => {
    setPrimaryImageIndex(index);
  };

  const handleSave = () => {
    if (!product) {
      toast({ title: 'Error', description: 'No product selected', variant: 'destructive' });
      return;
    }

    const filteredUrls = imageUrls.filter(url => url.trim() !== "");
    const primaryUrl = filteredUrls[primaryImageIndex] || filteredUrls[0] || null;
    
    updateProductMutation.mutate({
      image_url: primaryUrl,
      images: filteredUrls.length > 0 ? filteredUrls : null
    });
  };

  // Don't render if no product is selected
  if (!product) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto cyber-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <ImageIcon className="h-5 w-5 text-primary" />
            Manage Product Images
          </DialogTitle>
          <DialogDescription className="font-mono">
            Upload and manage images for {product.name}. The primary image will be shown in product listings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium font-display text-primary">Product Images</Label>
              <Button onClick={addImageUrl} size="sm" variant="outline" className="cyber-button">
                <Upload className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-mono">Image {index + 1}</Label>
                    {index === primaryImageIndex && (
                      <Badge variant="default" className="text-xs font-mono">
                        <Star className="h-3 w-3 mr-1" />
                        Primary
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      value={url}
                      onChange={(e) => updateImageUrl(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 cyber-input"
                    />
                    <Button
                      type="button"
                      onClick={() => setPrimaryImage(index)}
                      size="sm"
                      variant={index === primaryImageIndex ? "default" : "outline"}
                      disabled={!url.trim()}
                      className="cyber-button"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => removeImageUrl(index)}
                      size="sm"
                      variant="destructive"
                      disabled={imageUrls.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {url && (
                    <div className="mt-2">
                      <img
                        src={url}
                        alt={`Product image ${index + 1}`}
                        className="w-32 h-32 object-cover rounded-md neon-border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button onClick={() => onOpenChange(false)} variant="outline" className="cyber-button">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateProductMutation.isPending} className="cyber-button">
              {updateProductMutation.isPending ? "Saving..." : "Save Images"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
