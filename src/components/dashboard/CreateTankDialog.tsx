
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { toast as sonnerToast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const tankSchema = z.object({
  name: z.string().min(1, "Name is required"),
  size: z.coerce.number().min(1, "Size must be at least 1 gallon"),
  type: z.enum(["Freshwater", "Saltwater"]),
});

type TankFormValues = z.infer<typeof tankSchema>;

const createAquarium = async ({ name, size, type, userId }: TankFormValues & { userId: string }) => {
  const { data, error } = await supabase
    .from("aquariums")
    .insert([{ name, size, type, user_id: userId }])
    .select();

  if (error) throw error;
  return data;
};

export function CreateTankDialog() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<TankFormValues>({
    resolver: zodResolver(tankSchema),
    defaultValues: { name: "", size: 10, type: "Freshwater" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createAquarium,
    onSuccess: () => {
      sonnerToast.success("Aquarium created successfully!");
      queryClient.invalidateQueries({ queryKey: ['aquariums'] });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      sonnerToast.error("Failed to create aquarium", { description: error.message });
    },
  });

  const onSubmit = (values: TankFormValues) => {
    if (!user) {
      sonnerToast.error("You must be logged in to create an aquarium.");
      return;
    }
    mutate({ ...values, userId: user.id });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Tank
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <DialogHeader>
              <DialogTitle>Create New Aquarium</DialogTitle>
              <DialogDescription>Fill in the details for your new tank. You can change these later.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input placeholder="Reef Tank" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="size" render={({ field }) => (
                <FormItem>
                  <FormLabel>Size (Gallons)</FormLabel>
                  <FormControl><Input type="number" placeholder="75" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select tank type" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Freshwater">Freshwater</SelectItem>
                      <SelectItem value="Saltwater">Saltwater</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}/>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>{isPending ? "Creating..." : "Create Tank"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
