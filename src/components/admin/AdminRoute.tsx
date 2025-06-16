
import { useAuth } from "@/providers/AuthProvider";
import { Navigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminRouteProps {
    children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
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

    return <>{children}</>;
}
