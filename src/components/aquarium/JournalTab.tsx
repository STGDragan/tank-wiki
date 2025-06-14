
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const JournalTab = ({ aquariumId }: { aquariumId: string }) => {
  return (
    <Card className="mt-2">
      <CardHeader>
        <CardTitle>Journal</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Journal entries will be implemented here.</p>
      </CardContent>
    </Card>
  );
};

export default JournalTab;
