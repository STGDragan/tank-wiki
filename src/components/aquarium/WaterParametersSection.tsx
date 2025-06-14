
import { useState } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { WaterParameterCard } from '@/components/aquarium/WaterParameterCard';
import { AddWaterParameterForm } from '@/components/aquarium/AddWaterParameterForm';
import { PlusCircle } from 'lucide-react';

type WaterParameterReading = Tables<'water_parameters'> & {
    salinity?: number | null;
    alkalinity?: number | null;
    calcium?: number | null;
    magnesium?: number | null;
};

interface WaterParametersSectionProps {
  waterParameters: WaterParameterReading[];
  aquariumId: string;
  aquariumType: string | null;
}

export const WaterParametersSection = ({ waterParameters, aquariumId, aquariumType }: WaterParametersSectionProps) => {
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
      {waterParameters && waterParameters.length > 0 ? (
        <Carousel opts={{ align: "start" }} className="w-full">
          <CarouselContent>
            {waterParameters.map((item) => (
              <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4"><WaterParameterCard reading={item} aquariumType={aquariumType} /></CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious /><CarouselNext />
        </Carousel>
      ) : <p className="text-muted-foreground">No water parameter readings yet.</p>}
    </section>
  );
};
