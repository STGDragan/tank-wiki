
import { useState } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { LivestockCard } from '@/components/aquarium/LivestockCard';
import { AddLivestockForm } from '@/components/aquarium/AddLivestockForm';
import { PlusCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type Livestock = Tables<'livestock'> & { image_url?: string | null };

interface LivestockSectionProps {
    livestock: Livestock[];
    aquariumId: string;
}

export const LivestockSection = ({ livestock, aquariumId }: LivestockSectionProps) => {
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
                <Accordion type="multiple" className="w-full space-y-2">
                    {livestock.map((item) => (
                        <AccordionItem value={item.id} key={item.id} className="border rounded-lg border-b-0">
                            <AccordionTrigger className="p-4 hover:no-underline">
                                <span className="font-semibold text-lg text-left">{item.species}{item.name ? ` (${item.name})` : ''}</span>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 pt-0">
                                <LivestockCard livestock={item} />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : <p className="text-muted-foreground">No livestock added yet.</p>}
        </section>
    );
};
