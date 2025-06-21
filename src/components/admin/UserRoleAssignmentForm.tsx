
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Profile {
  id: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

type RoleType = "admin" | "user";

interface UserRoleAssignmentFormProps {
  profiles: Profile[];
  onAssignRole: (userId: string, role: RoleType) => void;
  isAssigning: boolean;
}

export function UserRoleAssignmentForm({ profiles, onAssignRole, isAssigning }: UserRoleAssignmentFormProps) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleType>("user");

  const formatUserDisplay = (profile: Profile) => {
    // Prioritize first_name + last_name, then full_name, then email
    let displayName = 'Unnamed User';
    
    if (profile.first_name && profile.last_name) {
      displayName = `${profile.first_name} ${profile.last_name}`;
    } else if (profile.full_name) {
      displayName = profile.full_name;
    }
    
    const email = profile.email || 'No email';
    return `${displayName} (${email})`;
  };

  const handleAssignRole = () => {
    if (!selectedUserId || !selectedRole) return;
    onAssignRole(selectedUserId, selectedRole);
    setSelectedUserId("");
    setSelectedRole("user");
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">Assign Role</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="user-select">Select User ({profiles?.length || 0} available)</Label>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a user..." />
            </SelectTrigger>
            <SelectContent>
              {profiles?.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {formatUserDisplay(profile)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role-select">Role</Label>
          <Select value={selectedRole} onValueChange={(value: RoleType) => setSelectedRole(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            onClick={handleAssignRole}
            disabled={!selectedUserId || isAssigning}
            className="w-full"
          >
            {isAssigning ? "Assigning..." : "Assign Role"}
          </Button>
        </div>
      </div>
    </div>
  );
}
