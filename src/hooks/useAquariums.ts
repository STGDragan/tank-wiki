
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type Aquarium = Tables<'aquariums'> & { image_url?: string | null };

const fetchAquariums = async (): Promise<Aquarium[]> => {
    const { data, error } = await supabase.from('aquariums').select('*');
    if (error) throw new Error(error.message);
    return (data as Aquarium[]) || [];
};

export const useAquariums = (enabled: boolean) => {
    return useQuery<Aquarium[]>({
        queryKey: ['aquariums'],
        queryFn: fetchAquariums,
        enabled: enabled,
    });
};
