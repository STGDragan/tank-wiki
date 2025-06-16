
import { useAuth } from "@/providers/AuthProvider";
import { Navigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { UserSubscriptionManager } from "@/components/admin/UserSubscriptionManager";

const SubscriptionManager = () => {
  const { roles, loading } = useAuth();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!roles?.includes('admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Subscription Manager</h1>
        <p className="text-muted-foreground mt-2">
          Manage user subscriptions, grant free access, and configure admin overrides.
        </p>
      </div>
      
      <UserSubscriptionManager />
    </div>
  );
};

export default SubscriptionManager;
