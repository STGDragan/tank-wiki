
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  profile?: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

interface CurrentRolesListProps {
  userRoles: UserRole[];
  onRemoveRole: (roleId: string) => void;
  isRemoving: boolean;
}

export function CurrentRolesList({ userRoles, onRemoveRole, isRemoving }: CurrentRolesListProps) {
  const formatUserDisplay = (profile?: UserRole['profile']) => {
    if (!profile) return 'Unnamed User';
    
    // Prioritize first_name + last_name, then full_name, then email
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    } else if (profile.first_name) {
      return profile.first_name;
    } else if (profile.last_name) {
      return profile.last_name;
    } else if (profile.full_name) {
      return profile.full_name;
    }
    
    return 'Unnamed User';
  };

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
                  {formatUserDisplay(userRole.profile)}
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
