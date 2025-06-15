
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
  type: z.enum([
    "Freshwater",
    "Planted Freshwater",
    "Freshwater Invertebrates",
    "Saltwater Fish-Only (FO)",
    "Fish-Only with Live Rock (FOWLR)",
    "Soft Coral Reef",
    "Mixed Reef (LPS + Soft)",
    "SPS Reef (Hard Coral)"
  ]),
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

export function CreateTankDialog({ aquariumCount }: { aquariumCount: number }) {
  const [open, setOpen] = useState(false);
  const { user, subscriber } = useAuth();
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

  const { mutate: createCheckout, isPending: isCreatingCheckout } = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('create-checkout-session');
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      sonnerToast.error("Could not create checkout session", { description: error.message });
    }
  });

  const onSubmit = (values: TankFormValues) => {
    if (!user) {
      sonnerToast.error("You must be logged in to create an aquarium.");
      return;
    }
    mutate({ ...values, userId: user.id });
  };

  const isFreeTier = !subscriber?.subscribed;
  const freeTierLimit = 3;
  const proTierLimit = 10;
  
  const atFreeTierLimit = isFreeTier && aquariumCount >= freeTierLimit;
  const atProTierLimit = subscriber?.subscribed && aquariumCount >= proTierLimit;

  const handleUpgrade = () => {
    createCheckout();
    setOpen(false);
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
        {atFreeTierLimit ? (
            <>
              <DialogHeader>
                <DialogTitle>Upgrade to AquaManager Pro</DialogTitle>
                <DialogDescription>
                  You're on the free plan, which allows up to {freeTierLimit} aquariums. Upgrade to Pro for just $9.99/year to create up to {proTierLimit} aquariums!
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Maybe Later</Button>
                <Button onClick={handleUpgrade} disabled={isCreatingCheckout}>
                  {isCreatingCheckout ? 'Redirecting...' : 'Upgrade Now'}
                </Button>
              </DialogFooter>
            </>
          ) : atProTierLimit ? (
            <>
              <DialogHeader>
                <DialogTitle>Pro Tier Limit Reached</DialogTitle>
                <DialogDescription>
                  You've reached the limit of {proTierLimit} aquariums for the Pro plan. To add more, please contact support about our enterprise options.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => setOpen(false)}>OK</Button>
              </DialogFooter>
            </>
          ) : (
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
                        <SelectItem value="Planted Freshwater">Planted Freshwater</SelectItem>
                        <SelectItem value="Freshwater Invertebrates">Freshwater Invertebrates</SelectItem>
                        <SelectItem value="Saltwater Fish-Only (FO)">Saltwater Fish-Only (FO)</SelectItem>
                        <SelectItem value="Fish-Only with Live Rock (FOWLR)">Fish-Only with Live Rock (FOWLR)</SelectItem>
                        <SelectItem value="Soft Coral Reef">Soft Coral Reef</SelectItem>
                        <SelectItem value="Mixed Reef (LPS + Soft)">Mixed Reef (LPS + Soft)</SelectItem>
                        <SelectItem value="SPS Reef (Hard Coral)">SPS Reef (Hard Coral)</SelectItem>
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
        )}
      </DialogContent>
    </Dialog>
  );
}
