
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { useAuth } from "@/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import AddWishlistItemForm, { AddWishlistItemFormRef } from "./AddWishlistItemForm";
import WishlistItemCard from "./WishlistItemCard";
import { useRef } from "react";

type WishlistItem = Tables<'wishlist_items'>;

const fetchWishlistItems = async (aquariumId: string): Promise<WishlistItem[]> => {
    const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('aquarium_id', aquariumId)
        .order('priority', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
};

interface WishlistTabProps {
    aquariumId: string;
    canEdit: boolean;
}

const WishlistTab = ({ aquariumId, canEdit }: WishlistTabProps) => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const formRef = useRef<AddWishlistItemFormRef>(null);

    const { data: items, isLoading, error } = useQuery({
        queryKey: ['wishlist_items', aquariumId],
        queryFn: () => fetchWishlistItems(aquariumId),
        enabled: !!aquariumId && !!user,
    });

    const addItemMutation = useMutation({
        mutationFn: async (newItem: Omit<TablesInsert<'wishlist_items'>, 'user_id' | 'aquarium_id' | 'id' | 'created_at'>) => {
            if (!user) throw new Error("You must be logged in to add items.");
            const { error } = await supabase.from('wishlist_items').insert({
                ...newItem,
                aquarium_id: aquariumId,
                user_id: user.id,
            });
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist_items', aquariumId] });
            toast({ title: 'Success', description: 'Wishlist item added.' });
            formRef.current?.reset();
        },
        onError: (err: Error) => {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
    });

    const deleteItemMutation = useMutation({
        mutationFn: async (itemId: string) => {
            const { error } = await supabase.from('wishlist_items').delete().eq('id', itemId);
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist_items', aquariumId] });
            toast({ title: 'Success', description: 'Wishlist item removed.' });
        },
        onError: (err: Error) => {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
    });

    if (isLoading) {
        return (
            <Card className="mt-2">
                <CardHeader>
                    <CardTitle>Wishlist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        );
    }
    
    if (error) {
        return <p className="mt-2">Error loading wishlist: {error.message}</p>
    }

    return (
        <div className="space-y-4 mt-2">
            {canEdit && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add to Wishlist</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AddWishlistItemForm ref={formRef} onSubmit={addItemMutation.mutate} isSubmitting={addItemMutation.isPending} />
                    </CardContent>
                </Card>
            )}
            <Card>
                <CardHeader>
                    <CardTitle>Your Wishlist</CardTitle>
                </CardHeader>
                <CardContent>
                    {items && items.length > 0 ? (
                        <div className="space-y-4">
                            {items.map(item => (
                                <WishlistItemCard 
                                    key={item.id} 
                                    item={item} 
                                    onDelete={() => deleteItemMutation.mutate(item.id)} 
                                    isDeleting={deleteItemMutation.isPending && deleteItemMutation.variables === item.id}
                                />
                            ))}
                        </div>
                    ) : (
                        <p>Your wishlist is empty. Add something!</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default WishlistTab;
