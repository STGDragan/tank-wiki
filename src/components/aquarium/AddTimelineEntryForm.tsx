
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "./ImageUploader";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const timelineEntrySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  entry_date: z.date(),
});

type TimelineEntryFormData = z.infer<typeof timelineEntrySchema>;

interface AddTimelineEntryFormProps {
  aquariumId: string;
  userId: string;
  onSubmit: (data: TimelineEntryFormData & { image_url?: string }) => void;
  isLoading: boolean;
}

export function AddTimelineEntryForm({ aquariumId, userId, onSubmit, isLoading }: AddTimelineEntryFormProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const form = useForm<TimelineEntryFormData>({
    resolver: zodResolver(timelineEntrySchema),
    defaultValues: {
      title: "",
      description: "",
      entry_date: new Date(),
    },
  });

  const handleSubmit = (data: TimelineEntryFormData) => {
    onSubmit({
      ...data,
      image_url: imageUrl || undefined,
    });
    form.reset();
    setImageUrl(null);
  };

  const handleImageUploadSuccess = (uploadedImageUrl?: string) => {
    if (uploadedImageUrl) {
      setImageUrl(uploadedImageUrl);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="New coral addition" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Added a beautiful torch coral to the right side of the tank..."
                  {...field}
                />
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
                        "w-full pl-3 text-left font-normal",
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

        <div className="space-y-2">
          <label className="text-sm font-medium">Image (Optional)</label>
          <ImageUploader
            aquariumId={aquariumId}
            onUploadSuccess={handleImageUploadSuccess}
            table="aquarium_timeline"
            recordId={`timeline-${Date.now()}`}
            aspect={4/3}
          />
          {imageUrl && (
            <div className="mt-2">
              <img src={imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-md" />
            </div>
          )}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Adding..." : "Add Timeline Entry"}
        </Button>
      </form>
    </Form>
  );
}
