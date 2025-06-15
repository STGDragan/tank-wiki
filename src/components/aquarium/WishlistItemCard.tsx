
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";
import { Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type WishlistItem = Tables<'wishlist_items'>;

interface WishlistItemCardProps {
    item: WishlistItem;
    onDelete: () => void;
    isDeleting: boolean;
}

const WishlistItemCard = ({ item, onDelete, isDeleting }: WishlistItemCardProps) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>
                        Added {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={onDelete} disabled={isDeleting}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                {item.notes && <p className="text-sm text-muted-foreground">{item.notes}</p>}
            </CardContent>
            <CardFooter className="flex items-center justify-between gap-2 flex-wrap">
                 <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.item_type}</Badge>
                    {item.priority && <Badge>Priority: {item.priority}</Badge>}
                </div>
                {item.estimated_price && (
                     <span className="text-sm font-semibold">${Number(item.estimated_price).toFixed(2)}</span>
                )}
            </CardFooter>
        </Card>
    );
};

export default WishlistItemCard;
