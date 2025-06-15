
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "../ui/aspect-ratio";

interface SharedTankCardProps {
  id: string;
  name: string;
  type: string;
  size: number;
  image_url: string | null;
  ownerName: string | null;
}

export function SharedTankCard({ id, name, type, size, image_url, ownerName }: SharedTankCardProps) {
  const defaultImageUrl = '/placeholder.svg';

  // Determine badge variant based on tank type
  const getBadgeVariant = () => {
    const freshwaterTypes = ["Freshwater", "Planted Freshwater", "Freshwater Invertebrates"];
    const saltwaterTypes = ["Saltwater Fish-Only (FO)", "Fish-Only with Live Rock (FOWLR)", "Soft Coral Reef", "Mixed Reef (LPS + Soft)", "SPS Reef (Hard Coral)"];
    
    if (freshwaterTypes.includes(type)) {
      return "secondary";
    } else if (saltwaterTypes.includes(type)) {
      return "default";
    }
    return "outline";
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>
          {size} Gallon {type} Tank
        </CardDescription>
        {ownerName && <CardDescription>Owner: {ownerName}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow">
        <Link to={`/aquarium/${id}`}>
          <AspectRatio ratio={16 / 9}>
            <img
              src={image_url || defaultImageUrl}
              alt={name}
              className="rounded-md object-cover w-full h-full"
            />
          </AspectRatio>
        </Link>
      </CardContent>
      <CardFooter>
        <Badge variant={getBadgeVariant()}>{type}</Badge>
      </CardFooter>
    </Card>
  );
}
