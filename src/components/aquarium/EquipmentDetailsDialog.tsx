
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { ImageUploader } from './ImageUploader';
import { Trash2, Calendar, Wrench } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

type Equipment = Tables<'equipment'>;

interface EquipmentDetailsDialogProps {
  equipment: Equipment;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (equipmentId: string) => void;
}

export function EquipmentDetailsDialog({ equipment, isOpen, onClose, onDelete }: EquipmentDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    type: equipment.type,
    brand: equipment.brand || '',
    model: equipment.model || '',
    notes: equipment.notes || '',
    image_url: equipment.image_url || '',
    installed_at: equipment.installed_at || ''
  });
  
  const queryClient = useQueryClient();

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('equipment')
        .update({
          type: formData.type,
          brand: formData.brand || null,
          model: formData.model || null,
          notes: formData.notes || null,
          image_url: formData.image_url || null,
          installed_at: formData.installed_at || null
        })
        .eq('id', equipment.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['equipment', equipment.aquarium_id] });
      toast({ title: 'Equipment updated successfully' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast({
        title: 'Error updating equipment',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  };

  const handleImageUploadSuccess = (imageUrl?: string) => {
    if (imageUrl) {
      setFormData(prev => ({ ...prev, image_url: imageUrl }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{equipment.type} Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Action buttons moved here, below the header */}
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="flex gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  <Wrench className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave}>Save</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              )}
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Equipment
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Equipment</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this {equipment.type}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { onDelete(equipment.id); onClose(); }}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          {formData.image_url && (
            <div className="space-y-2">
              <Label>Current Image</Label>
              <img src={formData.image_url} alt={equipment.type} className="w-full h-48 object-cover rounded-md" />
            </div>
          )}

          {isEditing && (
            <div className="space-y-2">
              <Label>Upload New Image</Label>
              <ImageUploader
                aquariumId={equipment.aquarium_id}
                onUploadSuccess={handleImageUploadSuccess}
                table="equipment"
                recordId={equipment.id}
                aspect={16/9}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Equipment Type</Label>
              {isEditing ? (
                <Input
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                />
              ) : (
                <p className="p-2 bg-muted rounded-md">{equipment.type}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Brand</Label>
              {isEditing ? (
                <Input
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="Enter brand name"
                />
              ) : (
                <p className="p-2 bg-muted rounded-md">{equipment.brand || 'Not specified'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Model</Label>
              {isEditing ? (
                <Input
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="Enter model number"
                />
              ) : (
                <p className="p-2 bg-muted rounded-md">{equipment.model || 'Not specified'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Installation Date</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.installed_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, installed_at: e.target.value }))}
                />
              ) : (
                <p className="p-2 bg-muted rounded-md flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {equipment.installed_at ? new Date(equipment.installed_at).toLocaleDateString() : 'Not set'}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            {isEditing ? (
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add notes about this equipment..."
                rows={4}
              />
            ) : (
              <p className="p-2 bg-muted rounded-md min-h-[100px]">{equipment.notes || 'No notes added'}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
