
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

const notesEntrySchema = z.object({
  title: z.string().min(1, "Title is required."),
  entry_date: z.date(),
  content: z.string().optional(),
});

type NotesEntryFormValues = z.infer<typeof notesEntrySchema>;

interface AddNotesEntryFormProps {
  aquariumId: string;
  onSuccess: () => void;
}

export const AddNotesEntryForm = ({ aquariumId, onSuccess }: AddNotesEntryFormProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const form = useForm<NotesEntryFormValues>({
    resolver: zodResolver(notesEntrySchema),
    defaultValues: {
      title: "",
      entry_date: new Date(),
      content: "",
    },
  });

  const addEntryMutation = useMutation({
    mutationFn: async (newEntry: Omit<Tables<'journal_entries'>, 'id' | 'created_at' | 'user_id'>) => {
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase.from("journal_entries").insert({ ...newEntry, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Note added!" });
      queryClient.invalidateQueries({ queryKey: ["journal_entries", aquariumId] });
      onSuccess();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error adding note",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: NotesEntryFormValues) {
    addEntryMutation.mutate({
      aquarium_id: aquariumId,
      title: values.title,
      content: values.content || null,
      entry_date: format(values.entry_date, 'yyyy-MM-dd'),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Water Change & Algae Scrub" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="entry_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Entry Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed notes about observations, changes, etc."
                  className="resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={addEntryMutation.isPending}>
          {addEntryMutation.isPending ? "Adding..." : "Add Note"}
        </Button>
      </form>
    </Form>
  );
};
