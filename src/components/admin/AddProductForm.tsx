
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import AddProductDialog from "./AddProductDialog";

export const AddProductForm = () => {
  return (
    <div className="container mx-auto px-4 py-6 mobile-nav-space">
      <Card className="cyber-card glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-primary">
            <Package className="h-5 w-5 text-primary" />
            Product Creation Hub
          </CardTitle>
          <CardDescription className="font-mono">
            Add new products manually with automated category and subcategory management.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <AddProductDialog />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
