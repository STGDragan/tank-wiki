
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SpeciesBrowser } from '@/components/aquarium/species-selector/SpeciesBrowser';
import { Fish } from 'lucide-react';

const SpeciesBrowserPage = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Fish className="mr-3 h-6 w-6" />
            Marine Species Database
          </CardTitle>
          <p className="text-muted-foreground">
            Explore detailed information about marine fish species, including care requirements, 
            compatibility notes, and tank specifications.
          </p>
        </CardHeader>
        <CardContent>
          <SpeciesBrowser />
        </CardContent>
      </Card>
    </div>
  );
};

export default SpeciesBrowserPage;
