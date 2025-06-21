
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Skull, Trash2, ExternalLink, ShoppingCart, Edit, Copy, Camera, AlertTriangle, Fish } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditLivestockForm } from "./EditLivestockForm";
import { getDetailedFishInfo } from '@/data/species/detailedFishData';
import { getDetailedFreshwaterFishInfo } from '@/data/species/detailedFreshwaterFishData';

type Livestock = Tables<'livestock'>;

interface EnhancedLivestockCardProps {
  livestock: Livestock;
  onUpdateQuantity: (livestockId: string, currentQuantity: number, change: number) => void;
  onDelete: (livestockId: string) => void;
  onDuplicate: (livestock: Livestock) => void;
  hasCompatibilityIssues?: boolean;
}

const fetchRelatedProduct = async (species: string) => {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      affiliate_links (
        link_url,
        provider
      )
    `)
    .ilike('name', `%${species}%`)
    .eq('visible', true)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching related product:", error);
    return null;
  }
  return data;
};

export const EnhancedLivestockCard = ({ 
  livestock, 
  onUpdateQuantity, 
  onDelete, 
  onDuplicate,
  hasCompatibilityIssues = false
}: EnhancedLivestockCardProps) => {
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  
  const { data: relatedProduct } = useQuery({
    queryKey: ['related-product', livestock.species],
    queryFn: () => fetchRelatedProduct(livestock.species),
  });

  const handleProductClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (relatedProduct?.affiliate_links?.[0]?.link_url) {
      window.open(relatedProduct.affiliate_links[0].link_url, '_blank');
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate(livestock);
  };

  // Get species info for compatibility warnings
  const speciesInfo = getDetailedFishInfo(livestock.species) || getDetailedFreshwaterFishInfo(livestock.species);
  const isAggressive = speciesInfo?.tags?.includes('aggressive') || speciesInfo?.tags?.includes('predatory');
  const isDifficult = speciesInfo?.difficulty === 'Advanced' || speciesInfo?.difficulty === 'Expert';

  return (
    <>
      <Card className={`relative hover:shadow-md transition-shadow cursor-pointer group ${hasCompatibilityIssues ? 'border-yellow-500 border-2' : ''}`} onClick={() => setEditDialogOpen(true)}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header with warnings */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Fish className="h-4 w-4" />
                  <h3 className="font-semibold text-lg">{livestock.species}</h3>
                  {hasCompatibilityIssues && (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
                {livestock.name && (
                  <p className="text-sm text-muted-foreground">"{livestock.name}"</p>
                )}
              </div>
              
              <div className="flex items-center gap-1 ml-2">
                <Badge variant={isAggressive ? "destructive" : isDifficult ? "secondary" : "outline"} className="shrink-0">
                  Qty: {livestock.quantity}
                </Badge>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); setEditDialogOpen(true); }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleDuplicate}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Warning badges */}
            {(isAggressive || isDifficult || hasCompatibilityIssues) && (
              <div className="flex flex-wrap gap-1">
                {isAggressive && (
                  <Badge variant="destructive" className="text-xs">
                    <Skull className="h-3 w-3 mr-1" />
                    Aggressive
                  </Badge>
                )}
                {isDifficult && (
                  <Badge variant="secondary" className="text-xs">
                    Advanced Care
                  </Badge>
                )}
                {hasCompatibilityIssues && (
                  <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Compatibility Issue
                  </Badge>
                )}
              </div>
            )}

            {/* Image */}
            {livestock.image_url && (
              <div className="w-full h-32 rounded-md overflow-hidden">
                <img 
                  src={livestock.image_url} 
                  alt={livestock.species}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Notes */}
            {livestock.notes && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {livestock.notes}
              </p>
            )}

            {/* Related product */}
            {relatedProduct && (
              <div className="p-2 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Related Product Available</p>
                {relatedProduct.affiliate_links?.[0] && (
                  <button 
                    onClick={handleProductClick}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    <span>Buy on {relatedProduct.affiliate_links[0].provider || 'Store'}</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}

            {/* Quantity controls */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={(e) => { e.stopPropagation(); onUpdateQuantity(livestock.id, livestock.quantity, -1); }}
                >
                  <Skull className="h-4 w-4" />
                </Button>
                <span className="font-bold text-lg min-w-[2rem] text-center">{livestock.quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={(e) => { e.stopPropagation(); onUpdateQuantity(livestock.id, livestock.quantity, 1); }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove {livestock.species} from your aquarium. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(livestock.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {livestock.species}</DialogTitle>
          </DialogHeader>
          <EditLivestockForm 
            livestock={livestock}
            onSuccess={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
