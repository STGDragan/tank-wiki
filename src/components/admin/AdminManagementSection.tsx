
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { useAdminUserRoles } from "@/hooks/useAdminUserRoles";
import { UserRoleAssignmentForm } from "./UserRoleAssignmentForm";
import { CurrentRolesList } from "./CurrentRolesList";

export function AdminManagementSection() {
  const {
    profiles,
    userRoles,
    isLoading,
    assignRoleMutation,
    removeRoleMutation
  } = useAdminUserRoles();

  const handleAssignRole = (userId: string, role: "admin" | "user") => {
    assignRoleMutation.mutate({ userId, role });
  };

  const handleRemoveRole = (roleId: string) => {
    removeRoleMutation.mutate(roleId);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Admin Role Management
        </CardTitle>
        <CardDescription>
          Assign and manage admin roles for users.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <UserRoleAssignmentForm
          profiles={profiles || []}
          onAssignRole={handleAssignRole}
          isAssigning={assignRoleMutation.isPending}
        />

        <CurrentRolesList
          userRoles={userRoles || []}
          onRemoveRole={handleRemoveRole}
          isRemoving={removeRoleMutation.isPending}
        />
      </CardContent>
    </Card>
  );
}
