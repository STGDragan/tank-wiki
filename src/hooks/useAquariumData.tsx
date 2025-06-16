import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useMemo } from "react";

type Livestock = Tables<'livestock'>;
type Equipment = Tables<'equipment'> & { image_url?: string | null };
type WaterParameterReading = Tables<'water_parameters'>;
type MaintenanceTask = Tables<'maintenance'> & { equipment: { type: string, brand: string | null, model: string | null } | null };
type Aquarium = Tables<'aquariums'> & { image_url?: string | null };
type Preset = Tables<'tank_type_presets'>;
type CustomSetting = Tables<'aquarium_parameter_settings'>;
type Medication = Tables<'medications'>;

const fetchAquariumById = async (id: string) => {
  const { data, error } = await supabase
    .from("aquariums")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return data;
};

const fetchLivestock = async (aquariumId: string): Promise<Livestock[]> => {
  const { data, error } = await supabase
    .from("livestock")
    .select("*")
    .eq("aquarium_id", aquariumId)
    .order("added_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Livestock[]) || [];
};

const fetchEquipment = async (aquariumId: string): Promise<Equipment[]> => {
  const { data, error } = await supabase
    .from("equipment")
    .select("*")
    .eq("aquarium_id", aquariumId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Equipment[]) || [];
};

const fetchWaterParameters = async (aquariumId: string): Promise<WaterParameterReading[]> => {
  const { data, error } = await supabase
    .from("water_parameters")
    .select("*")
    .eq("aquarium_id", aquariumId)
    .order("recorded_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as WaterParameterReading[]) || [];
};

const fetchMaintenanceTasks = async (aquariumId: string): Promise<MaintenanceTask[]> => {
    const { data, error } = await supabase
        .from('maintenance')
        .select('*, equipment(type, brand, model)')
        .eq('aquarium_id', aquariumId)
        .order('completed_date', { ascending: false, nullsFirst: true })
        .order('due_date', { ascending: true, nullsFirst: false });
    
    if (error) throw new Error(error.message);
    return data as MaintenanceTask[] || [];
};

const fetchTankTypePresets = async (aquariumType: string | null): Promise<Preset[]> => {
    if (!aquariumType) return [];
    const { data, error } = await supabase
        .from('tank_type_presets')
        .select('*')
        .eq('name', aquariumType);

    if (error) throw new Error(error.message);
    return data || [];
};

const fetchAquariumParameterSettings = async (aquariumId: string): Promise<CustomSetting[]> => {
    const { data, error } = await supabase
        .from('aquarium_parameter_settings')
        .select('*')
        .eq('aquarium_id', aquariumId);

    if (error) throw new Error(error.message);
    return data || [];
};

const fetchMedications = async (aquariumId: string): Promise<Tables<'medications'>[]> => {
    const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('aquarium_id', aquariumId)
        .order('start_date', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
};

export const useAquariumData = (aquariumId: string | undefined, userId: string | undefined) => {
    const { data: aquarium, isLoading: isAquariumLoading, error: aquariumError } = useQuery({
        queryKey: ['aquarium', aquariumId],
        queryFn: () => fetchAquariumById(aquariumId!),
        enabled: !!aquariumId && !!userId,
    });

    const { data: livestock, isLoading: isLivestockLoading, error: livestockError } = useQuery({
        queryKey: ['livestock', aquariumId],
        queryFn: () => fetchLivestock(aquariumId!),
        enabled: !!aquariumId && !!userId,
    });

    const { data: equipment, isLoading: isEquipmentLoading, error: equipmentError } = useQuery({
        queryKey: ['equipment', aquariumId],
        queryFn: () => fetchEquipment(aquariumId!),
        enabled: !!aquariumId && !!userId,
    });

    const { data: waterParameters, isLoading: isWaterParamsLoading, error: waterParamsError } = useQuery({
        queryKey: ['water_parameters', aquariumId],
        queryFn: () => fetchWaterParameters(aquariumId!),
        enabled: !!aquariumId && !!userId,
    });

    const { data: tasks, isLoading: isMaintenanceLoading, error: maintenanceError } = useQuery({
        queryKey: ['maintenance', aquariumId],
        queryFn: () => fetchMaintenanceTasks(aquariumId!),
        enabled: !!aquariumId && !!userId,
    });

    const { data: presets, isLoading: presetsLoading, error: presetsError } = useQuery({
        queryKey: ['tank_type_presets', aquarium?.type],
        queryFn: () => fetchTankTypePresets(aquarium!.type),
        enabled: !!aquarium,
    });

    const { data: customSettings, isLoading: customSettingsLoading, error: customSettingsError } = useQuery({
        queryKey: ['aquarium_parameter_settings', aquariumId],
        queryFn: () => fetchAquariumParameterSettings(aquariumId!),
        enabled: !!aquariumId && !!userId,
    });

    const { data: medications, isLoading: isMedicationsLoading, error: medicationsError } = useQuery({
        queryKey: ['medications', aquariumId],
        queryFn: () => fetchMedications(aquariumId!),
        enabled: !!aquariumId && !!userId,
    });

    const pendingTasks = useMemo(() => {
        return (tasks || []).filter(task => !task.completed_date);
    }, [tasks]);

    const isLoading = isAquariumLoading || isLivestockLoading || isEquipmentLoading || isWaterParamsLoading || isMaintenanceLoading || presetsLoading || customSettingsLoading || isMedicationsLoading;
    const error = aquariumError || livestockError || equipmentError || waterParamsError || maintenanceError || presetsError || customSettingsError || medicationsError;

    return {
        aquarium,
        livestock,
        equipment,
        waterParameters,
        tasks,
        presets,
        customSettings,
        medications,
        pendingTasks,
        isLoading,
        error,
    };
};
