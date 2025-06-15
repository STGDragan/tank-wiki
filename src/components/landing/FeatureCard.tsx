
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <Card className="text-center h-full flex flex-col bg-card/50 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4 w-fit">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};
