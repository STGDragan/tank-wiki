
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Plus } from "lucide-react";

const MobileInstructions = () => {
  return (
    <Card className="border-dashed bg-muted/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Smartphone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1 flex items-center gap-1">
              <Plus className="h-3 w-3" />
              Add TankWiki to your home screen
            </p>
            <p className="leading-relaxed">
              <span className="font-medium">iPhone:</span> Tap Share <span className="mx-1">→</span> Add to Home Screen
              <br />
              <span className="font-medium">Android:</span> Tap Menu <span className="mx-1">→</span> Add to Home screen
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileInstructions;
