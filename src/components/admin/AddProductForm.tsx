
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import AddProductDialog from "./AddProductDialog";
import { AmazonProductImportDialog } from "./AmazonProductImportDialog";

export const AddProductForm = () => {
  return (
    <Card className="cyber-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Package className="h-5 w-5 text-primary" />
          Product Creation Hub
        </CardTitle>
        <CardDescription className="font-mono">
          Add new products manually or import from Amazon with automated affiliate link processing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <AddProductDialog />
          <AmazonProductImportDialog />
        </div>
      </CardContent>
    </Card>
  );
};
