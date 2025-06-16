
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Camera } from "lucide-react";
import { AddTimelineEntryForm } from "./AddTimelineEntryForm";
import { TimelineCard } from "./TimelineCard";
import { useTimelineData } from "@/hooks/useTimelineData";
import { Skeleton } from "@/components/ui/skeleton";

interface TimelineTabProps {
  aquariumId: string;
  userId: string;
  canEdit?: boolean;
}

interface TimelineFormData {
  title: string;
  description?: string;
  entry_date: Date;
  image_url?: string;
}

export function TimelineTab({ aquariumId, userId, canEdit = true }: TimelineTabProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const {
    timelineEntries,
    isLoading,
    error,
    addTimelineEntry,
    deleteTimelineEntry,
    isAddingEntry,
  } = useTimelineData(aquariumId, userId);

  const handleAddEntry = (data: TimelineFormData) => {
    addTimelineEntry({
      title: data.title,
      description: data.description || null,
      entry_date: data.entry_date.toISOString().split('T')[0], // Convert Date to string
      image_url: data.image_url || null,
      aquarium_id: aquariumId,
      user_id: userId,
    });
    setIsAddDialogOpen(false);
  };

  const handleDeleteEntry = (entryId: string) => {
    deleteTimelineEntry(entryId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Error loading timeline entries: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Timeline</h2>
          <p className="text-muted-foreground">
            Track your aquarium's progress over time with photos and notes
          </p>
        </div>
        {canEdit && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Timeline Entry</DialogTitle>
                <DialogDescription>
                  Document your aquarium's progress with photos and notes.
                </DialogDescription>
              </DialogHeader>
              <AddTimelineEntryForm
                aquariumId={aquariumId}
                userId={userId}
                onSubmit={handleAddEntry}
                isLoading={isAddingEntry}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {timelineEntries && timelineEntries.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {timelineEntries.map((entry) => (
            <TimelineCard
              key={entry.id}
              entry={entry}
              onDelete={canEdit ? handleDeleteEntry : undefined}
              canEdit={canEdit}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="mr-2 h-5 w-5" />
              No Timeline Entries Yet
            </CardTitle>
            <CardDescription>
              Start documenting your aquarium's journey by adding your first timeline entry.
            </CardDescription>
          </CardHeader>
          {canEdit && (
            <CardContent>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Timeline Entry</DialogTitle>
                    <DialogDescription>
                      Document your aquarium's progress with photos and notes.
                    </DialogDescription>
                  </DialogHeader>
                  <AddTimelineEntryForm
                    aquariumId={aquariumId}
                    userId={userId}
                    onSubmit={handleAddEntry}
                    isLoading={isAddingEntry}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
