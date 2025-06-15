
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { AddWaterParameterForm } from '@/components/aquarium/AddWaterParameterForm';
import { PlusCircle } from 'lucide-react';

interface WaterParametersSectionProps {
  aquariumId: string;
  aquariumType: string | null;
}

export const WaterParametersSection = ({ aquariumId, aquariumType }: WaterParametersSectionProps) => {
  const [isAddWaterParamsOpen, setAddWaterParamsOpen] = useState(false);

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Water Parameters</h2>
        <Drawer open={isAddWaterParamsOpen} onOpenChange={setAddWaterParamsOpen}>
          <DrawerTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Reading</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader><DrawerTitle>Add New Water Parameter Reading</DrawerTitle></DrawerHeader>
            <div className="px-4 pb-4 max-h-[80vh] overflow-y-auto">
                <AddWaterParameterForm aquariumId={aquariumId} aquariumType={aquariumType} onSuccess={() => setAddWaterParamsOpen(false)} />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </section>
  );
};
