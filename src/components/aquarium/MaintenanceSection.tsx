
import { useState } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { MaintenanceCard } from '@/components/aquarium/MaintenanceCard';
import { AddMaintenanceTaskForm } from '@/components/aquarium/AddMaintenanceTaskForm';
import { PlusCircle } from 'lucide-react';

type MaintenanceTask = Tables<'maintenance'> & { equipment: { type: string, brand: string | null, model: string | null } | null };

interface MaintenanceSectionProps {
    tasks: MaintenanceTask[];
    aquariumId: string;
    onMarkComplete: (taskId: string, completedDate: Date) => void;
    onDelete: (taskId: string) => void;
}

export const MaintenanceSection = ({ tasks, aquariumId, onMarkComplete, onDelete }: MaintenanceSectionProps) => {
    const [isAddTaskOpen, setAddTaskOpen] = useState(false);

    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Maintenance Schedule</h2>
                <Drawer open={isAddTaskOpen} onOpenChange={setAddTaskOpen}>
                    <DrawerTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Task</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader><DrawerTitle>Add New Maintenance Task</DrawerTitle></DrawerHeader>
                        <div className="px-4 pb-4 max-h-[80vh] overflow-y-auto">
                            <AddMaintenanceTaskForm aquariumId={aquariumId} onSuccess={() => setAddTaskOpen(false)} />
                        </div>
                    </DrawerContent>
                </Drawer>
            </div>
            {tasks && tasks.length > 0 ? (
                <Carousel opts={{ align: "start" }} className="w-full">
                    <CarouselContent>
                        {tasks.map((task) => (
                            <CarouselItem key={task.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                <MaintenanceCard task={task} onMarkComplete={onMarkComplete} onDelete={onDelete} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious /><CarouselNext />
                </Carousel>
            ) : <p className="text-muted-foreground">No maintenance tasks added yet.</p>}
        </section>
    );
}
