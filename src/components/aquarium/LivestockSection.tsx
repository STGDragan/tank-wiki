
import { useState } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { LivestockCard } from '@/components/aquarium/LivestockCard';
import { AddLivestockForm } from '@/components/aquarium/AddLivestockForm';
import { PlusCircle, Fish } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center text-2xl">
                            <Fish className="mr-3 h-6 w-6" />
                            Livestock
                        </CardTitle>
                        <CardDescription className="mt-2">Manage the inhabitants of your aquarium.</CardDescription>
                    </div>
                    {canEdit && (
                        <Drawer open={isAddLivestockOpen} onOpenChange={setAddLivestockOpen}>
                            <DrawerTrigger asChild>
                                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Livestock</Button>
                            </DrawerTrigger>
                            <DrawerContent>
                                <DrawerHeader><DrawerTitle>Add New Livestock</DrawerTitle></DrawerHeader>
                                <div className="px-4 pb-4"><AddLivestockForm aquariumId={aquariumId} aquariumType={aquariumType} onSuccess={() => setAddLivestockOpen(false)} /></div>
                            </DrawerContent>
                        </Drawer>
                    )}
                </CardHeader>
                <CardContent>
                    {livestock && livestock.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {livestock.map((item) => (
                                <LivestockCard livestock={item} key={item.id} onUpdateQuantity={onUpdateQuantity} onDelete={onDelete} />
                            ))}
                        </div>
                    ) : <p className="text-muted-foreground text-center py-8">No livestock added yet.</p>}
                </CardContent>
            </Card>
        </div>
    );
};
