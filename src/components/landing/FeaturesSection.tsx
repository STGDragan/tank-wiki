
import { Droplets, Fish, Bot, CalendarClock } from "lucide-react";
import { FeatureCard } from "./FeatureCard";
import { Link } from "react-router-dom";

const features = [
  {
    icon: <Droplets className="h-8 w-8 text-primary" />,
    title: "Track Water Parameters",
    description: "Keep a detailed log of your water quality to ensure a stable environment for your aquatic friends.",
  },
  {
    icon: <Fish className="h-8 w-8 text-primary" />,
    title: "Manage Your Livestock",
    description: "Catalog your fish, corals, and invertebrates. Track their health, feeding schedule, and growth.",
  },
  {
    icon: <CalendarClock className="h-8 w-8 text-primary" />,
    title: "Schedule Maintenance",
    description: "Never miss a water change or filter cleaning again with our customizable maintenance scheduler.",
  },
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: "AI-Powered Insights",
    description: "Get smart recommendations for improving your tank's health based on your logged data.",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Everything you need for a healthy tank</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            TankWiki provides all the tools to simplify aquarium husbandry, so you can spend more time enjoying your tank.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <Link to="/login" key={feature.title}>
              <FeatureCard icon={feature.icon} title={feature.title} description={feature.description} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
