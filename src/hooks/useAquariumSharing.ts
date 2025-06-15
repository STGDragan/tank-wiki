
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type AquariumShare = Tables<'aquarium_shares'>;

const fetchAquariumShares = async (aquariumId: string): Promise<AquariumShare[]> => {
  const { data, error } = await supabase
    .from('aquarium_shares')
    .select('*')
    .eq('aquarium_id', aquariumId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

export const useAquariumSharing = (aquariumId: string | undefined) => {
  return useQuery({
    queryKey: ['aquarium_shares', aquariumId],
    queryFn: () => fetchAquariumShares(aquariumId!),
    enabled: !!aquariumId,
  });
};
