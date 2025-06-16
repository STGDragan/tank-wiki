
import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit, Trash2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type TimelineEntry = Tables<'aquarium_timeline'>;

interface TimelineCardProps {
  entry: TimelineEntry;
  onEdit?: (entry: TimelineEntry) => void;
  onDelete?: (entryId: string) => void;
  canEdit?: boolean;
}

export function TimelineCard({ entry, onEdit, onDelete, canEdit = false }: TimelineCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{entry.title}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-1 h-4 w-4" />
              {format(new Date(entry.entry_date), "PPP")}
            </div>
          </div>
          {canEdit && (
            <div className="flex space-x-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(entry)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Timeline Entry</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this timeline entry? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(entry.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {entry.image_url && (
          <div className="rounded-lg overflow-hidden">
            <img
              src={entry.image_url}
              alt={entry.title}
              className="w-full h-48 object-cover"
            />
          </div>
        )}
        {entry.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {entry.description}
          </p>
        )}
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Added {format(new Date(entry.created_at), "PPP")}</span>
          {entry.updated_at !== entry.created_at && (
            <Badge variant="secondary" className="text-xs">
              Updated {format(new Date(entry.updated_at), "PPP")}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
