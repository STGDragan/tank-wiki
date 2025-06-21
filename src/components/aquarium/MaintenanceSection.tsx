
import { useState } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { MaintenanceCard } from '@/components/aquarium/MaintenanceCard';
import { EquipmentBasedMaintenanceForm } from '@/components/aquarium/EquipmentBasedMaintenanceForm';
import { ConsumablesRecommendations } from '@/components/aquarium/ConsumablesRecommendations';
import { PlusCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddMaintenanceTaskForm } from '@/components/aquarium/AddMaintenanceTaskForm';

type MaintenanceTask = Tables<'maintenance'> & { equipment: { type: string, brand: string | null, model: string | null } | null };

interface MaintenanceSectionProps {
    tasks: MaintenanceTask[];
    aquariumId: string;
    aquariumType: string | null;
    aquariumSize: number | null | undefined;
    onMarkComplete: (taskId: string, completedDate: Date) => void;
    onDelete: (taskId: string) => void;
    showRecommendations?: boolean;
}

export const MaintenanceSection = ({ 
    tasks, 
    aquariumId, 
    aquariumType, 
    aquariumSize, 
    onMarkComplete, 
    onDelete, 
    showRecommendations = true 
}: MaintenanceSectionProps) => {
    const [isAddTaskOpen, setAddTaskOpen] = useState(false);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center text-2xl">
                            <Calendar className="mr-3 h-6 w-6" />
                            Maintenance Schedule
                        </CardTitle>
                        <CardDescription className="mt-2">Keep track of your upcoming and overdue maintenance tasks.</CardDescription>
                    </div>
                    <Drawer open={isAddTaskOpen} onOpenChange={setAddTaskOpen}>
                        <DrawerTrigger asChild>
                            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Task</Button>
                        </DrawerTrigger>
                        <DrawerContent>
                            <DrawerHeader><DrawerTitle>Add New Maintenance Task</DrawerTitle></DrawerHeader>
                            <div className="px-4 pb-4 max-h-[80vh] overflow-y-auto">
                                <Tabs defaultValue="equipment-based" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="equipment-based">Equipment-Based</TabsTrigger>
                                        <TabsTrigger value="general">General Task</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="equipment-based" className="mt-4">
                                        <EquipmentBasedMaintenanceForm 
                                            aquariumId={aquariumId} 
                                            aquariumType={aquariumType} 
                                            aquariumSize={aquariumSize} 
                                            onSuccess={() => setAddTaskOpen(false)} 
                                        />
                                    </TabsContent>
                                    <TabsContent value="general" className="mt-4">
                                        <AddMaintenanceTaskForm 
                                            aquariumId={aquariumId} 
                                            aquariumType={aquariumType} 
                                            aquariumSize={aquariumSize} 
                                            onSuccess={() => setAddTaskOpen(false)} 
                                        />
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </DrawerContent>
                    </Drawer>
                </CardHeader>
                <CardContent>
                    {tasks && tasks.length > 0 ? (
                        <Carousel opts={{ align: "start" }} className="w-full">
                            <CarouselContent>
                                {tasks.map((task) => (
                                    <CarouselItem key={task.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                        <MaintenanceCard task={task} onMarkComplete={onMarkComplete} onDelete={onDelete} />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="ml-12" /><CarouselNext className="mr-12" />
                        </Carousel>
                    ) : <p className="text-muted-foreground text-center py-8">No maintenance tasks scheduled yet.</p>}
                </CardContent>
            </Card>
            
            {showRecommendations && <ConsumablesRecommendations aquariumType={aquariumType} />}
        </div>
    );
}
