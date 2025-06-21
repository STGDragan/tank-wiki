
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";

export const SupportSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50/80 to-cyan-50/80">
      <div className="container mx-auto px-4 md:px-6">
        <Card className="max-w-4xl mx-auto bg-white/70 backdrop-blur-sm border-blue-100/50 shadow-soft">
          <CardContent className="p-8 md:p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mb-8 mx-auto shadow-soft">
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
              Built to Support Your Aquarium Journey
            </h2>
            
            <div className="space-y-4 text-lg leading-relaxed text-slate-700 max-w-3xl mx-auto">
              <p>
                Maintaining an aquarium should feel rewarding—not overwhelming.
                TankWiki was created to help hobbyists keep their tanks healthy and stable with less stress and more confidence.
              </p>
              
              <p>
                We're not here to tell you what works best—we're here to help you figure out what works best for your tank.
              </p>
              
              <p>
                With powerful tracking, gentle reminders, and built-in guidance, TankWiki gives you the tools to understand your aquarium's rhythm and keep it thriving.
              </p>
              
              <p className="font-medium text-blue-700">
                Whether you're just getting started or fine-tuning an advanced setup, we're here to support your journey—every drop, every test, every tank.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
