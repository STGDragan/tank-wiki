
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WishlistTab = ({ aquariumId }: { aquariumId: string }) => {
  return (
    <Card className="mt-2">
      <CardHeader>
        <CardTitle>Wishlist</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Wishlist items will be implemented here.</p>
      </CardContent>
    </Card>
  );
};

export default WishlistTab;
