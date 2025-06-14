
import { Wrench, Fish, Droplets } from 'lucide-react';
import { format } from 'date-fns';

type LogEntry = {
  id: string;
  type: 'maintenance' | 'livestock' | 'water_parameter';
  date: Date;
  title: string;
  description: React.ReactNode;
};

interface LogTabProps {
  logEntries: LogEntry[];
}

const getIcon = (type: LogEntry['type']) => {
  switch (type) {
    case 'maintenance':
      return <Wrench className="h-5 w-5 text-blue-500" />;
    case 'livestock':
      return <Fish className="h-5 w-5 text-green-500" />;
    case 'water_parameter':
      return <Droplets className="h-5 w-5 text-cyan-500" />;
    default:
      return null;
  }
};

export const LogTab = ({ logEntries }: LogTabProps) => {
  if (logEntries.length === 0) {
    return <p className="text-muted-foreground mt-4">No log entries yet. This log will show completed maintenance, livestock additions, and water tests.</p>;
  }

  return (
    <div className="mt-4 space-y-6">
      {logEntries.map((entry) => (
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
  );
};
