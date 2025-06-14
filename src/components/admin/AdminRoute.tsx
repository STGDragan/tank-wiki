
import { useAuth } from "@/providers/AuthProvider";
import { Navigate, Outlet } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export const AdminRoute = () => {
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

    return <Outlet />;
}
