
import { useState } from 'react';
import { Wrench, Fish, Droplets, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useLogEntries } from '@/hooks/useLogEntries';
import { useAquariumData } from '@/hooks/useAquariumData';
import { useAuth } from '@/providers/AuthProvider';

type LogEntry = {
  id: string;
  type: 'maintenance' | 'livestock' | 'water_parameter' | 'equipment' | 'note';
  date: Date;
  title: string;
  description: React.ReactNode;
};

interface LogTabProps {
  aquariumId: string;
}

const getIcon = (type: LogEntry['type']) => {
  switch (type) {
    case 'maintenance':
      return <Wrench className="h-5 w-5 text-blue-500" />;
    case 'livestock':
      return <Fish className="h-5 w-5 text-green-500" />;
    case 'water_parameter':
      return <Droplets className="h-5 w-5 text-cyan-500" />;
    case 'equipment':
      return <Wrench className="h-5 w-5 text-purple-500" />;
    case 'note':
      return <FileText className="h-5 w-5 text-orange-500" />;
    default:
      return null;
  }
};

const filterOptions: { value: LogEntry['type'] | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'livestock', label: 'Livestock' },
  { value: 'water_parameter', label: 'Water Tests' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'note', label: 'Notes' },
];

export const LogTab = ({ aquariumId }: LogTabProps) => {
  const [filter, setFilter] = useState<LogEntry['type'] | 'all'>('all');
  const { user } = useAuth();
  
  const {
    tasks,
    livestock,
    waterParameters,
    equipment,
  } = useAquariumData(aquariumId, user?.id);

  const logEntries = useLogEntries(tasks, livestock, waterParameters, equipment);

  if (logEntries.length === 0) {
    return <p className="text-muted-foreground mt-4">No log entries yet. This log will show completed maintenance, livestock additions, water tests, and notes.</p>;
  }

  const filteredEntries =
    filter === 'all'
      ? logEntries
      : logEntries.filter((entry) => entry.type === filter);

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={filter === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {filteredEntries.length === 0 ? (
        <p className="text-muted-foreground mt-4 text-center">No entries found for this filter.</p>
      ) : (
        <div className="space-y-6">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="flex items-start space-x-4 relative before:absolute before:left-4 before:top-8 before:h-full before:w-px before:bg-muted last:before:h-0">
              <div className="flex-shrink-0 pt-1 z-10">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background ring-8 ring-background">
                  {getIcon(entry.type)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-foreground">{entry.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(entry.date, 'PPp')}
                  </p>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {entry.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
