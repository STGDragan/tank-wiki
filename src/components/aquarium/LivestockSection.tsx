
import { useState, useMemo } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { EnhancedLivestockCard } from '@/components/aquarium/EnhancedLivestockCard';
import { AddLivestockForm } from '@/components/aquarium/AddLivestockForm';
import { LivestockCompatibilityAlert } from '@/components/aquarium/LivestockCompatibilityAlert';
import { PlusCircle, Fish } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/hooks/use-toast';
import { getDetailedFishInfo } from '@/data/species/detailedFishData';
import { getDetailedFreshwaterFishInfo } from '@/data/species/detailedFreshwaterFishData';

type Livestock = Tables<'livestock'>;

interface LivestockSectionProps {
    livestock: Livestock[];
    aquariumId: string;
    aquariumType: string | null;
    onUpdateQuantity: (livestockId: string, currentQuantity: number, change: number) => void;
    onDelete: (livestockId: string) => void;
    canEdit: boolean;
    showRecommendations?: boolean;
}

export const LivestockSection = ({ 
    livestock, 
    aquariumId, 
    aquariumType, 
    onUpdateQuantity, 
    onDelete, 
    canEdit,
    showRecommendations = true 
}: LivestockSectionProps) => {
    const [isAddLivestockOpen, setAddLivestockOpen] = useState(false);
    const [duplicateData, setDuplicateData] = useState<Partial<any> | null>(null);
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const duplicateLivestockMutation = useMutation({
        mutationFn: async (originalLivestock: Livestock) => {
            if (!user) throw new Error("User not authenticated");
            
            const { error } = await supabase.from("livestock").insert({
                aquarium_id: originalLivestock.aquarium_id,
                user_id: user.id,
                species: originalLivestock.species,
                name: originalLivestock.name ? `${originalLivestock.name} (Copy)` : null,
                quantity: 1, // Default to 1 for duplicates
                notes: originalLivestock.notes,
                added_at: new Date().toISOString(),
            });
            
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['livestock', aquariumId] });
            toast({ title: "Livestock duplicated successfully!" });
        },
        onError: (error) => {
            toast({
                title: "Error duplicating livestock",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleDuplicate = (livestock: Livestock) => {
        duplicateLivestockMutation.mutate(livestock);
    };

    // Check for compatibility issues for each livestock
    const livestockWithCompatibility = useMemo(() => {
        const species = livestock.map(l => l.species);
        
        return livestock.map(l => {
            // Get detailed info for this species
            const speciesInfo = getDetailedFishInfo(l.species) || getDetailedFreshwaterFishInfo(l.species);
            
            // Check if this species has compatibility issues with others
            let hasIssues = false;
            
            if (speciesInfo) {
                // Check for aggressive species
                const isAggressive = speciesInfo.tags?.includes('aggressive') || speciesInfo.tags?.includes('predatory');
                
                // Check for territorial conflicts
                const isTerritorial = speciesInfo.tags?.includes('territorial');
                const otherTerritorialSpecies = livestock.filter(other => 
                    other.id !== l.id && 
                    (getDetailedFishInfo(other.species)?.tags?.includes('territorial') || 
                     getDetailedFreshwaterFishInfo(other.species)?.tags?.includes('territorial'))
                );
                
                // Check for predation risks
                const canEatOthers = livestock.some(other => 
                    other.id !== l.id && 
                    (speciesInfo.max_size || 0) > ((getDetailedFishInfo(other.species)?.max_size || getDetailedFreshwaterFishInfo(other.species)?.max_size) || 0) * 2
                );
                
                hasIssues = isAggressive || (isTerritorial && otherTerritorialSpecies.length > 0) || canEatOthers;
            }
            
            return { ...l, hasCompatibilityIssues: hasIssues };
        });
    }, [livestock]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center text-2xl">
                            <Fish className="mr-3 h-6 w-6" />
                            Livestock
                        </CardTitle>
                        <CardDescription className="mt-2">Manage the inhabitants of your aquarium with automatic compatibility checking.</CardDescription>
                    </div>
                    {canEdit && (
                        <Drawer open={isAddLivestockOpen} onOpenChange={setAddLivestockOpen}>
                            <DrawerTrigger asChild>
                                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Livestock</Button>
                            </DrawerTrigger>
                            <DrawerContent>
                                <DrawerHeader><DrawerTitle>Add New Livestock</DrawerTitle></DrawerHeader>
                                <div className="px-4 pb-4">
                                    <AddLivestockForm 
                                        aquariumId={aquariumId} 
                                        aquariumType={aquariumType} 
                                        onSuccess={() => {
                                            setAddLivestockOpen(false);
                                            setDuplicateData(null);
                                        }}
                                        initialData={duplicateData || undefined}
                                    />
                                </div>
                            </DrawerContent>
                        </Drawer>
                    )}
                </CardHeader>
                <CardContent>
                    <LivestockCompatibilityAlert livestock={livestock} aquariumType={aquariumType} />
                    
                    {livestock && livestock.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {livestockWithCompatibility.map((item) => (
                                <EnhancedLivestockCard 
                                    livestock={item} 
                                    key={item.id} 
                                    onUpdateQuantity={onUpdateQuantity} 
                                    onDelete={onDelete}
                                    onDuplicate={handleDuplicate}
                                    hasCompatibilityIssues={item.hasCompatibilityIssues}
                                />
                            ))}
                        </div>
                    ) : <p className="text-muted-foreground text-center py-8">No livestock added yet. Add your first fish to get started with automatic compatibility checking.</p>}
                </CardContent>
            </Card>
        </div>
    );
};
