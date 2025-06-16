
import { useAuth } from "@/providers/AuthProvider";
import { Navigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminManagement as AdminManagementComponent } from "@/components/admin/AdminManagement";

const AdminManagement = () => {
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
        <h1 className="text-2xl font-semibold">Admin Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage admin roles and view audit trail of all administrative actions.
        </p>
      </div>
      
      <AdminManagementComponent />
    </div>
  );
};

export default AdminManagement;
