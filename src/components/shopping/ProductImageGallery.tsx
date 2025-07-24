
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  primaryImage: string;
}

export const ProductImageGallery = ({ images, productName, primaryImage }: ProductImageGalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Combine primary image with additional images, ensuring no duplicates
  const allImages = [primaryImage, ...images.filter(img => img !== primaryImage)].filter(Boolean);
  
  if (allImages.length <= 1) {
    return (
      <div className="w-full max-h-96 overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
        <img
          src={primaryImage}
          alt={productName}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="space-y-4">
      {/* Main image display */}
      <div className="relative w-full max-h-96 overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
        <img
          src={allImages[selectedImageIndex]}
          alt={`${productName} ${selectedImageIndex + 1}`}
          className="w-full h-full object-contain"
        />
        
        {/* Navigation arrows */}
        {allImages.length > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
        
        {/* Image counter */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {selectedImageIndex + 1} / {allImages.length}
        </div>
      </div>
      
      {/* Thumbnail grid */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {allImages.slice(1, 5).map((image, index) => (
            <div
              key={index}
              className={`aspect-square overflow-hidden rounded border cursor-pointer transition-all ${
                selectedImageIndex === index + 1 ? 'ring-2 ring-primary' : 'hover:opacity-80'
              }`}
              onClick={() => setSelectedImageIndex(index + 1)}
            >
              <img
                src={image}
                alt={`${productName} ${index + 2}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
