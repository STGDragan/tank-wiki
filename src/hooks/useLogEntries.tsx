
import { useMemo } from "react";
import { format } from 'date-fns';
import { Tables } from "@/integrations/supabase/types";

type Livestock = Tables<'livestock'>;
type Equipment = Tables<'equipment'>;
type WaterParameterReading = Tables<'water_parameters'>;
type MaintenanceTask = Tables<'maintenance'> & { equipment: { type: string, brand: string | null, model: string | null } | null };
type JournalEntry = Tables<'journal_entries'>;
type Medication = Tables<'medications'>;

type LogEntry = {
    id: string;
    type: 'maintenance' | 'livestock' | 'water_parameter' | 'equipment' | 'note' | 'medication';
    date: Date;
    title: string;
    description: React.ReactNode;
};

export const useLogEntries = (
    tasks: MaintenanceTask[] | undefined,
    livestock: Livestock[] | undefined,
    waterParameters: WaterParameterReading[] | undefined,
    equipment: Equipment[] | undefined,
    journalEntries?: JournalEntry[] | undefined,
    aquariumType?: string | null,
    medications?: Medication[] | undefined
) => {
    return useMemo(() => {
        const entries: LogEntry[] = [];

        const completedTasks = tasks?.filter(task => task.completed_date) || [];
        completedTasks.forEach(task => {
            entries.push({
                id: `m-${task.id}`,
                type: 'maintenance',
                date: new Date(task.completed_date!),
                title: 'Maintenance Task Completed',
                description: (
                    <div>
                        <p className="font-semibold">{task.task}</p>
                        {task.notes && <p className="text-xs mt-1">Notes: {task.notes}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                            Task created on: {format(new Date(task.created_at), 'PP')}
                        </p>
                    </div>
                )
            });
        });

        (livestock || []).forEach(item => {
            entries.push({
                id: `l-${item.id}`,
                type: 'livestock',
                date: new Date(item.added_at),
                title: 'Livestock Added',
                description: (
                    <div>
                        <p className="font-semibold">{item.quantity}x {item.species}{item.name ? ` (${item.name})` : ''}</p>
                        {item.notes && <p className="text-xs mt-1">Notes: {item.notes}</p>}
                    </div>
                )
            });
        });

        (waterParameters || []).forEach(reading => {
            const isFreshwater = aquariumType === "Freshwater";
            const isSaltwaterFO = aquariumType === "Saltwater Fish-Only (FO)";
            
            const params = [
                reading.temperature != null ? `Temp: ${reading.temperature}°` : null,
                reading.ph != null ? `pH: ${reading.ph}` : null,
                reading.nitrate != null ? `Nitrate: ${reading.nitrate} ppm` : null,
                reading.nitrite != null ? `Nitrite: ${reading.nitrite} ppm` : null,
                reading.ammonia != null ? `Ammonia: ${reading.ammonia} ppm` : null,
                // Hide GH and KH for freshwater AND saltwater fish-only tanks
                !isFreshwater && !isSaltwaterFO && reading.gh != null ? `GH: ${reading.gh} dGH` : null,
                !isFreshwater && !isSaltwaterFO && reading.kh != null ? `KH: ${reading.kh} dKH` : null,
                reading.co2 != null ? `CO2: ${reading.co2} ppm` : null,
                reading.phosphate != null ? `Phosphate: ${reading.phosphate} ppm` : null,
                reading.copper != null ? `Copper: ${reading.copper} ppm` : null,
                reading.salinity != null ? `Salinity: ${reading.salinity} ppt` : null,
                reading.alkalinity != null ? `Alkalinity: ${reading.alkalinity} dKH` : null,
                reading.calcium != null ? `Calcium: ${reading.calcium} ppm` : null,
                reading.magnesium != null ? `Magnesium: ${reading.magnesium} ppm` : null,
            ].filter(Boolean).join(' | ');

            entries.push({
                id: `wp-${reading.id}`,
                type: 'water_parameter',
                date: new Date(reading.recorded_at),
                title: 'Water Parameters Tested',
                description: <p>{params}</p>
            });
        });

        (equipment || []).forEach(item => {
            entries.push({
                id: `eq-${item.id}`,
                type: 'equipment',
                date: new Date(item.installed_at || item.created_at),
                title: 'Equipment Added',
                description: (
                    <div>
                        <p className="font-semibold">{item.type}{item.brand || item.model ? ` - ${[item.brand, item.model].filter(Boolean).join(' ')}` : ''}</p>
                        {item.notes && <p className="text-xs mt-1">Notes: {item.notes}</p>}
                    </div>
                )
            });
        });

        (journalEntries || []).forEach(entry => {
            entries.push({
                id: `note-${entry.id}`,
                type: 'note',
                date: new Date(entry.created_at),
                title: 'Note Added',
                description: (
                    <div>
                        <p className="font-semibold">{entry.title}</p>
                        {entry.content && <p className="text-xs mt-1">{entry.content}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                            Note date: {format(new Date(entry.entry_date), 'PP')}
                        </p>
                    </div>
                )
            });
        });

        (medications || []).forEach(medication => {
            entries.push({
                id: `med-${medication.id}`,
                type: 'medication',
                date: new Date(medication.start_date),
                title: 'Medication Started',
                description: (
                    <div>
                        <p className="font-semibold">{medication.name}</p>
                        {medication.dosage && <p className="text-xs mt-1">Dosage: {medication.dosage}</p>}
                        {medication.frequency && <p className="text-xs mt-1">Frequency: {medication.frequency}</p>}
                        {medication.end_date && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Treatment period: {format(new Date(medication.start_date), 'PP')} - {format(new Date(medication.end_date), 'PP')}
                            </p>
                        )}
                    </div>
                )
            });
        });

        return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [tasks, livestock, waterParameters, equipment, journalEntries, aquariumType, medications]);
};
