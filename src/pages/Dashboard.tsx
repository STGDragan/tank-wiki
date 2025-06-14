
import { TankCard } from "@/components/dashboard/TankCard";
import { CreateTankDialog } from "@/components/dashboard/CreateTankDialog";

const mockTanks = [
  { id: '1', name: 'Main Reef', type: 'Saltwater', size: 120 },
  { id: '2', name: 'Planted Community', type: 'Freshwater', size: 75 },
  { id: '3', name: 'Shrimp Nano', type: 'Freshwater', size: 10 },
];

const Dashboard = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <CreateTankDialog />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockTanks.map(tank => (
          <TankCard key={tank.id} {...tank} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
