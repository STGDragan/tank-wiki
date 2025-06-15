
import { useState } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { EquipmentCard } from '@/components/aquarium/EquipmentCard';
import { AddEquipmentForm } from '@/components/aquarium/AddEquipmentForm';
import { PlusCircle, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type Equipment = Tables<'equipment'> & { image_url?: string | null };

interface EquipmentSectionProps {
    equipment: Equipment[];
    aquariumId: string;
    onDelete: (equipmentId: string) => void;
}

export const EquipmentSection = ({ equipment, aquariumId, onDelete }: EquipmentSectionProps) => {
    const [isAddEquipmentOpen, setAddEquipmentOpen] = useState(false);

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="flex items-center text-2xl">
                        <Settings className="mr-3 h-6 w-6" />
                        Equipment
                    </CardTitle>
                    <CardDescription className="mt-2">Manage all the equipment for your aquarium.</CardDescription>
                </div>
                <Drawer open={isAddEquipmentOpen} onOpenChange={setAddEquipmentOpen}>
                    <DrawerTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Equipment</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader><DrawerTitle>Add New Equipment</DrawerTitle></DrawerHeader>
                        <div className="px-4 pb-4 max-h-[80vh] overflow-y-auto"><AddEquipmentForm aquariumId={aquariumId} onSuccess={() => setAddEquipmentOpen(false)} /></div>
                    </DrawerContent>
                </Drawer>
            </CardHeader>
            <CardContent>
                {equipment && equipment.length > 0 ? (
                    <Carousel opts={{ align: "start" }} className="w-full">
                        <CarouselContent>
                            {equipment.map((item) => (
                                <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                    <EquipmentCard equipment={item} onDelete={onDelete} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="ml-12" /><CarouselNext className="mr-12" />
                    </Carousel>
                ) : <p className="text-muted-foreground text-center py-8">No equipment added yet.</p>}
            </CardContent>
        </Card>
    );
};
