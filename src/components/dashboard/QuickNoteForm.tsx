
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

const quickNoteSchema = z.object({
  notes: z.string().optional(),
});

type QuickNoteFormValues = z.infer<typeof quickNoteSchema>;

interface QuickNoteFormProps {
  aquariumId: string;
  actionType: string;
  initialNotes?: string;
  onSuccess: () => void;
}

const getActionTitle = (actionType: string): string => {
  const titles: Record<string, string> = {
    water_change: 'Water Change',
    water_test: 'Water Test',
    clean_filter: 'Filter Cleaning',
    maintenance: 'General Maintenance',
  };
  return titles[actionType] || 'Activity';
};

export const QuickNoteForm = ({ aquariumId, actionType, initialNotes, onSuccess }: QuickNoteFormProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const form = useForm<QuickNoteFormValues>({
    resolver: zodResolver(quickNoteSchema),
    defaultValues: {
      notes: initialNotes || "",
    },
  });

  const addQuickNoteMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase.from("journal_entries").insert({
        aquarium_id: aquariumId,
        user_id: user.id,
        title: data.title,
        content: data.content,
        entry_date: format(new Date(), 'yyyy-MM-dd'),
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Activity logged successfully!" });
      queryClient.invalidateQueries({ queryKey: ["journal_entries", aquariumId] });
      onSuccess();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error logging activity",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: QuickNoteFormValues) {
    const title = getActionTitle(actionType);
    const content = values.notes || initialNotes || '';
    
    addQuickNoteMutation.mutate({ title, content });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional details about this activity..."
                  className="resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={addQuickNoteMutation.isPending} className="flex-1">
            {addQuickNoteMutation.isPending ? "Logging..." : "Log Activity"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
