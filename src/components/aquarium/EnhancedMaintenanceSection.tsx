
import { useState } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { MaintenanceTaskCard } from '@/components/aquarium/MaintenanceTaskCard';
import { MaintenanceStats } from '@/components/aquarium/MaintenanceStats';
import { EquipmentBasedMaintenanceForm } from '@/components/aquarium/EquipmentBasedMaintenanceForm';
import { ConsumablesRecommendations } from '@/components/aquarium/ConsumablesRecommendations';
import { PlusCircle, Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddMaintenanceTaskForm } from '@/components/aquarium/AddMaintenanceTaskForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type MaintenanceTask = Tables<'maintenance'> & { equipment: { type: string, brand: string | null, model: string | null } | null };

interface EnhancedMaintenanceSectionProps {
    tasks: MaintenanceTask[];
    aquariumId: string;
    aquariumType: string | null;
    aquariumSize: number | null | undefined;
    onMarkComplete: (taskId: string, completedDate: Date) => void;
    onDelete: (taskId: string) => void;
    showRecommendations?: boolean;
}

export const EnhancedMaintenanceSection = ({ 
    tasks, 
    aquariumId, 
    aquariumType, 
    aquariumSize, 
    onMarkComplete, 
    onDelete, 
    showRecommendations = true 
}: EnhancedMaintenanceSectionProps) => {
    const [isAddTaskOpen, setAddTaskOpen] = useState(false);
    const [filter, setFilter] = useState<string>("all");

    const filterTasks = (tasks: MaintenanceTask[], filterType: string) => {
        const now = new Date();
        
        switch (filterType) {
            case "overdue":
                return tasks.filter(task => 
                    task.due_date && 
                    new Date(task.due_date) < now && 
                    !task.completed_date
                );
            case "due-soon":
                return tasks.filter(task => 
                    task.due_date && 
                    !task.completed_date && 
                    new Date(task.due_date).getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000 &&
                    new Date(task.due_date) >= now
                );
            case "completed":
                return tasks.filter(task => task.completed_date);
            case "pending":
                return tasks.filter(task => !task.completed_date);
            default:
                return tasks;
        }
    };

    const filteredTasks = filterTasks(tasks, filter);

    // Sort tasks: overdue first, then due soon, then by due date
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        const now = new Date();
        
        // Completed tasks go to the end
        if (a.completed_date && !b.completed_date) return 1;
        if (!a.completed_date && b.completed_date) return -1;
        
        if (!a.completed_date && !b.completed_date) {
            // Both are pending
            const aOverdue = a.due_date && new Date(a.due_date) < now;
            const bOverdue = b.due_date && new Date(b.due_date) < now;
            
            // Overdue tasks first
            if (aOverdue && !bOverdue) return -1;
            if (!aOverdue && bOverdue) return 1;
            
            // Then sort by due date
            if (a.due_date && b.due_date) {
                return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
            }
            if (a.due_date && !b.due_date) return -1;
            if (!a.due_date && b.due_date) return 1;
        }
        
        return 0;
    });

    return (
        <div className="space-y-6">
            <MaintenanceStats tasks={tasks} />
            
            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center text-2xl">
                            <Calendar className="mr-3 h-6 w-6" />
                            Maintenance Schedule
                        </CardTitle>
                        <CardDescription className="mt-2">
                            Keep track of your upcoming and overdue maintenance tasks.
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="w-40">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filter tasks" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Tasks</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                                <SelectItem value="due-soon">Due Soon</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        <Drawer open={isAddTaskOpen} onOpenChange={setAddTaskOpen}>
                            <DrawerTrigger asChild>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" /> 
                                    Add Task
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent>
                                <DrawerHeader>
                                    <DrawerTitle>Add New Maintenance Task</DrawerTitle>
                                </DrawerHeader>
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
                    </div>
                </CardHeader>
                
                <CardContent>
                    {sortedTasks && sortedTasks.length > 0 ? (
                        <Carousel opts={{ align: "start" }} className="w-full">
                            <CarouselContent>
                                {sortedTasks.map((task) => (
                                    <CarouselItem key={task.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                        <MaintenanceTaskCard 
                                            task={task} 
                                            onMarkComplete={onMarkComplete} 
                                            onDelete={onDelete} 
                                        />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="ml-12" />
                            <CarouselNext className="mr-12" />
                        </Carousel>
                    ) : (
                        <div className="text-center py-12">
                            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground text-lg">
                                {filter === "all" 
                                    ? "No maintenance tasks scheduled yet." 
                                    : `No ${filter.replace('-', ' ')} tasks found.`
                                }
                            </p>
                            {filter !== "all" && (
                                <Button 
                                    variant="outline" 
                                    onClick={() => setFilter("all")} 
                                    className="mt-2"
                                >
                                    Show All Tasks
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
            
            {showRecommendations && <ConsumablesRecommendations aquariumType={aquariumType} />}
        </div>
    );
};
