
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EquipmentTab = ({ aquariumId }: { aquariumId: string }) => {
  return (
    <Card className="mt-2">
      <CardHeader>
        <CardTitle>Equipment</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Equipment tracking will be implemented here.</p>
      </CardContent>
    </Card>
  );
};

export default EquipmentTab;
