
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  profile?: {
    full_name?: string;
    email?: string;
  };
}

interface CurrentRolesListProps {
  userRoles: UserRole[];
  onRemoveRole: (roleId: string) => void;
  isRemoving: boolean;
}

export function CurrentRolesList({ userRoles, onRemoveRole, isRemoving }: CurrentRolesListProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <Users className="h-5 w-5" />
        Current Role Assignments
      </h3>
      <div className="space-y-3">
        {userRoles?.map((userRole) => (
          <div key={userRole.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-medium">
                  {userRole.profile?.full_name || 'Unnamed User'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {userRole.profile?.email || 'No email'}
                </p>
              </div>
              <Badge variant={userRole.role === 'admin' ? 'default' : 'secondary'}>
                {userRole.role}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemoveRole(userRole.id)}
              disabled={isRemoving}
            >
              Remove
            </Button>
          </div>
        ))}
        {(!userRoles || userRoles.length === 0) && (
          <p className="text-muted-foreground text-center py-8">
            No role assignments found.
          </p>
        )}
      </div>
    </div>
  );
}
