
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { Button } from '@/components/ui/button';
import { Plus, Skull, Trash2, ExternalLink, ShoppingCart, Edit, Copy, Camera } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditLivestockForm } from "./EditLivestockForm";

type Livestock = Tables<'livestock'>;

interface EditableLivestockCardProps {
  livestock: Livestock;
  onUpdateQuantity: (livestockId: string, currentQuantity: number, change: number) => void;
  onDelete: (livestockId: string) => void;
  onDuplicate: (livestock: Livestock) => void;
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

export const EditableLivestockCard = ({ 
  livestock, 
  onUpdateQuantity, 
  onDelete, 
  onDuplicate 
}: EditableLivestockCardProps) => {
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  
  const { data: relatedProduct } = useQuery({
    queryKey: ['related-product', livestock.species],
    queryFn: () => fetchRelatedProduct(livestock.species),
  });

  const handleProductClick = () => {
    if (relatedProduct?.affiliate_links?.[0]?.link_url) {
      window.open(relatedProduct.affiliate_links[0].link_url, '_blank');
    }
  };

  const handleDuplicate = () => {
    onDuplicate(livestock);
  };

  return (
    <Card className="relative hover:shadow-md transition-shadow cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1" onClick={() => setEditDialogOpen(true)}>
            <h3 className="font-semibold text-lg">{livestock.species}</h3>
            {livestock.name && (
              <p className="text-sm text-muted-foreground">"{livestock.name}"</p>
            )}
            {livestock.notes && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {livestock.notes}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
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

        {livestock.image_url && (
          <div className="mb-3">
            <img 
              src={livestock.image_url} 
              alt={livestock.species}
              className="w-full h-32 object-cover rounded-md"
            />
          </div>
        )}

        {relatedProduct && (
          <div className="mb-3 p-2 bg-muted rounded-md">
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

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(livestock.id, livestock.quantity, -1)}>
              <Skull className="h-4 w-4" />
            </Button>
            <span className="font-bold text-lg min-w-[2rem] text-center">{livestock.quantity}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(livestock.id, livestock.quantity, 1)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" className="h-8 w-8">
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
      </CardContent>
    </Card>
  );
};
