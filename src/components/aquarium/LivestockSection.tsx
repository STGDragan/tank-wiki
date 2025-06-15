
import { useState } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { LivestockCard } from '@/components/aquarium/LivestockCard';
import { AddLivestockForm } from '@/components/aquarium/AddLivestockForm';
import { PlusCircle } from 'lucide-react';

type Livestock = Tables<'livestock'> & { image_url?: string | null };

interface LivestockSectionProps {
    livestock: Livestock[];
    aquariumId: string;
    onUpdateQuantity: (livestockId: string, currentQuantity: number, change: number) => void;
}

export const LivestockSection = ({ livestock, aquariumId, onUpdateQuantity }: LivestockSectionProps) => {
    const [isAddLivestockOpen, setAddLivestockOpen] = useState(false);

    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Livestock</h2>
                <Drawer open={isAddLivestockOpen} onOpenChange={setAddLivestockOpen}>
                    <DrawerTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Livestock</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader><DrawerTitle>Add New Livestock</DrawerTitle></DrawerHeader>
                        <div className="px-4 pb-4"><AddLivestockForm aquariumId={aquariumId} onSuccess={() => setAddLivestockOpen(false)} /></div>
                    </DrawerContent>
                </Drawer>
            </div>
            {livestock && livestock.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {livestock.map((item) => (
                        <LivestockCard livestock={item} key={item.id} onUpdateQuantity={onUpdateQuantity} />
                    ))}
                </div>
            ) : <p className="text-muted-foreground">No livestock added yet.</p>}
        </section>
    );
};
