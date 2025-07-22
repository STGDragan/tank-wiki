
import { useState } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { MaintenanceTaskCard } from '@/components/aquarium/MaintenanceTaskCard';
import { MaintenanceStats } from '@/components/aquarium/MaintenanceStats';
import { EquipmentBasedMaintenanceForm } from '@/components/aquarium/EquipmentBasedMaintenanceForm';
import { ConsumablesRecommendations } from '@/components/aquarium/ConsumablesRecommendations';
import { DefaultMaintenanceSetup } from '@/components/maintenance/DefaultMaintenanceSetup';
import { PlusCircle, Calendar, Filter, Crown, Star, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddMaintenanceTaskForm } from '@/components/aquarium/AddMaintenanceTaskForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/providers/AuthProvider';

type MaintenanceTask = Tables<'maintenance'> & { equipment: { type: string, brand: string | null, model: string | null } | null };

interface MaintenanceSectionProps {
    tasks: MaintenanceTask[];
    aquariumId: string;
    aquariumType: string | null;
    aquariumSize: number | null | undefined;
    onMarkComplete: (taskId: string, completedDate: Date, additionalData?: any) => void;
    onDelete: (taskId: string) => void;
    showRecommendations?: boolean;
    onRefresh?: () => void;
}

export const MaintenanceSection = ({ 
    tasks, 
    aquariumId, 
    aquariumType, 
    aquariumSize, 
    onMarkComplete, 
    onDelete, 
    showRecommendations = true,
    onRefresh 
}: MaintenanceSectionProps) => {
    const [isAddTaskOpen, setAddTaskOpen] = useState(false);
    const [filter, setFilter] = useState<string>("all");
    const { hasActiveSubscription } = useAuth();

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

    // Check if user has any scheduled maintenance tasks (default schedule check)
    const hasScheduledTasks = tasks.some(task => !task.completed_date);
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            {hasActiveSubscription && (
                <Card className="border-gradient-to-r from-yellow-400/20 to-yellow-600/20 bg-gradient-to-r from-yellow-50/50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/20">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Crown className="h-5 w-5 text-yellow-600" />
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                                <Star className="h-3 w-3 mr-1" />
                                Pro Features Active
                            </Badge>
                        </div>
                        <CardDescription className="text-sm text-muted-foreground">
                            🎉 <strong>Premium maintenance features unlocked!</strong> Enjoy equipment-based task creation, 
                            advanced filtering, maintenance statistics, and product recommendations.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}
            
            <Card>
                <CardHeader className="flex flex-row items-start justify-between pb-4">
                    <div>
                        <CardTitle className="flex items-center text-2xl">
                            <Calendar className="mr-3 h-6 w-6" />
                            Maintenance Schedule
                            {hasActiveSubscription && (
                                <Badge variant="outline" className="ml-3 text-xs border-yellow-500 text-yellow-600">
                                    <Zap className="h-3 w-3 mr-1" />
                                    Enhanced
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription className="mt-2">
                            Keep track of your upcoming and overdue maintenance tasks.
                            {hasActiveSubscription && (
                                <span className="text-yellow-600 font-medium"> Pro features include equipment-based tasks, advanced filtering, and detailed analytics.</span>
                            )}
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        {hasActiveSubscription && (
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
                        )}
                        
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
                                    {hasActiveSubscription ? (
                                        <Tabs defaultValue="equipment-based" className="w-full">
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="equipment-based">
                                                    <Crown className="h-4 w-4 mr-2" />
                                                    Equipment-Based
                                                </TabsTrigger>
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
                                    ) : (
                                        <AddMaintenanceTaskForm 
                                            aquariumId={aquariumId} 
                                            aquariumType={aquariumType} 
                                            aquariumSize={aquariumSize} 
                                            onSuccess={() => setAddTaskOpen(false)} 
                                        />
                                    )}
                                </div>
                            </DrawerContent>
                        </Drawer>
                    </div>
                </CardHeader>
                
                <CardContent>
                    {/* Maintenance Statistics */}
                    <MaintenanceStats tasks={tasks} />
                    
                    {hasActiveSubscription && (
                        <div className="mt-6 mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Crown className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Premium Features Active</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50/80 to-blue-100/80 dark:from-blue-950/30 dark:to-blue-900/30 border border-blue-200/60 dark:border-blue-800/60">
                                    <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/50">
                                        <Crown className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-xs text-blue-900 dark:text-blue-100">Equipment-Based Tasks</p>
                                        <p className="text-xs text-blue-700 dark:text-blue-300">Create from equipment</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50/80 to-purple-100/80 dark:from-purple-950/30 dark:to-purple-900/30 border border-purple-200/60 dark:border-purple-800/60">
                                    <div className="p-1.5 rounded-full bg-purple-100 dark:bg-purple-900/50">
                                        <Filter className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-xs text-purple-900 dark:text-purple-100">Advanced Filtering</p>
                                        <p className="text-xs text-purple-700 dark:text-purple-300">Filter by status</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50/80 to-green-100/80 dark:from-green-950/30 dark:to-green-900/30 border border-green-200/60 dark:border-green-800/60">
                                    <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/50">
                                        <Star className="h-3 w-3 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-xs text-green-900 dark:text-green-100">Smart Recommendations</p>
                                        <p className="text-xs text-green-700 dark:text-green-300">Product suggestions</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {sortedTasks && sortedTasks.length > 0 ? (
                        <Carousel opts={{ align: "start" }} className="w-full">
                            <CarouselContent>
                                {sortedTasks.map((task) => (
                                    <CarouselItem key={task.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                        <MaintenanceTaskCard 
                                            task={task} 
                                            onMarkComplete={onMarkComplete} 
                                            onDelete={onDelete}
                                            hasActiveSubscription={hasActiveSubscription}
                                        />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="ml-12" />
                            <CarouselNext className="mr-12" />
                        </Carousel>
                    ) : (
                        <div className="space-y-6">
                            {/* Show default maintenance setup for pro users with no scheduled tasks */}
                            {hasActiveSubscription && !hasScheduledTasks && filter === "all" && user?.id && (
                                <DefaultMaintenanceSetup
                                    aquariumId={aquariumId}
                                    userId={user.id}
                                    hasActiveSubscription={hasActiveSubscription}
                                    onSetupComplete={() => onRefresh?.()}
                                />
                            )}
                            
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
                        </div>
                    )}
                </CardContent>
            </Card>
            
            {showRecommendations && hasActiveSubscription && (
                <ConsumablesRecommendations aquariumType={aquariumType} />
            )}
        </div>
    );
};
