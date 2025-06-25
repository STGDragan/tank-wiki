
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
  product: Tables<'products'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductImageManager = ({ product, open, onOpenChange }: ProductImageManagerProps) => {
  const [imageUrls, setImageUrls] = useState<string[]>(product.images || [product.image_url].filter(Boolean) || [""]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProductMutation = useMutation({
    mutationFn: async (updates: Partial<Tables<'products'>>) => {
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
    const filteredUrls = imageUrls.filter(url => url.trim() !== "");
    const primaryUrl = filteredUrls[primaryImageIndex] || filteredUrls[0] || null;
    
    updateProductMutation.mutate({
      image_url: primaryUrl,
      images: filteredUrls.length > 0 ? filteredUrls : null
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Manage Product Images
          </DialogTitle>
          <DialogDescription>
            Upload and manage images for {product.name}. The primary image will be shown in product listings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Product Images</Label>
              <Button onClick={addImageUrl} size="sm" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Image {index + 1}</Label>
                    {index === primaryImageIndex && (
                      <Badge variant="default" className="text-xs">
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
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => setPrimaryImage(index)}
                      size="sm"
                      variant={index === primaryImageIndex ? "default" : "outline"}
                      disabled={!url.trim()}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    {imageUrls.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeImageUrl(index)}
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {url && (
                    <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-muted">
                      <img
                        src={url}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {index === primaryImageIndex && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <Star className="h-3 w-3 fill-current" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Image Preview Grid</h3>
            <div className="grid grid-cols-4 gap-2">
              {imageUrls.filter(url => url.trim()).map((url, index) => (
                <div
                  key={index}
                  className={`relative aspect-square border-2 rounded-lg overflow-hidden cursor-pointer transition-colors ${
                    index === primaryImageIndex ? 'border-primary' : 'border-muted hover:border-border'
                  }`}
                  onClick={() => setPrimaryImage(index)}
                >
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === primaryImageIndex && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateProductMutation.isPending}>
              {updateProductMutation.isPending ? "Saving..." : "Save Images"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
