
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WaterParametersTab = ({ aquariumId }: { aquariumId: string }) => {
  return (
    <Card className="mt-2">
      <CardHeader>
        <CardTitle>Water Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Water parameter tracking will be implemented here.</p>
      </CardContent>
    </Card>
  );
};

export default WaterParametersTab;
