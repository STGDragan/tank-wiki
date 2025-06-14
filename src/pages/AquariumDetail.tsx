
import { useParams } from "react-router-dom";

const AquariumDetail = () => {
  const { id } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Aquarium Details</h1>
      <p className="text-muted-foreground mt-2">Showing details for tank ID: {id}</p>
      <div className="mt-6 p-8 border rounded-lg bg-card">
        <p>Details about the aquarium will go here.</p>
        <p>This will include water parameters, livestock, equipment, and notes.</p>
      </div>
    </div>
  );
};

export default AquariumDetail;
