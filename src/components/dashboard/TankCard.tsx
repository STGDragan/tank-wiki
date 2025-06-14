
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface TankCardProps {
  id: string;
  name: string;
  type: string;
  size: number;
  image_url: string | null;
}

export function TankCard({ id, name, type, size, image_url }: TankCardProps) {
  const imageUrl = image_url || `https://placehold.co/600x400/34D399/FFFFFF?text=${encodeURIComponent(name)}`;
  return (
    <Card className="flex flex-col">
      <CardHeader className="p-0">
        <Link to={`/aquarium/${id}`}>
          <img src={imageUrl} alt={name} className="rounded-t-lg aspect-video object-cover w-full" />
        </Link>
      </CardHeader>
      <div className="p-6 flex-grow flex flex-col">
        <CardTitle>{name}</CardTitle>
        <CardDescription>{type}</CardDescription>
        <CardContent className="p-0 pt-2 flex-grow">
          <p className="text-sm text-muted-foreground">{size} Gallons</p>
        </CardContent>
        <CardFooter className="p-0 pt-4">
          <Button variant="outline" asChild className="w-full mt-auto">
            <Link to={`/aquarium/${id}`}>
              View Details <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
