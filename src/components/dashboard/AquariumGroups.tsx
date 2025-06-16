
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TankCard } from "./TankCard";
import { CreateTankDialog } from "./CreateTankDialog";
import { Settings, Plus, Edit, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AquariumGroup {
  id: string;
  name: string;
  description?: string;
  aquariumIds: string[];
}

interface Aquarium {
  id: string;
  name: string;
  type: string | null;
  size: number | null;
  image_url: string | null;
  user_id: string;
}

interface AquariumGroupsProps {
  aquariums: Aquarium[];
  onDeleteAquarium: (id: string) => void;
  aquariumCount: number;
}

export function AquariumGroups({ aquariums, onDeleteAquarium, aquariumCount }: AquariumGroupsProps) {
  const [sectionTitle, setSectionTitle] = useState("My Aquariums");
  const [groups, setGroups] = useState<AquariumGroup[]>([
    {
      id: "default",
      name: "All Aquariums",
      aquariumIds: aquariums.map(aq => aq.id)
    }
  ]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [editingGroup, setEditingGroup] = useState<AquariumGroup | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    
    const newGroup: AquariumGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      description: newGroupDescription,
      aquariumIds: []
    };
    
    setGroups([...groups, newGroup]);
    setNewGroupName("");
    setNewGroupDescription("");
  };

  const handleDeleteGroup = (groupId: string) => {
    if (groupId === "default") return; // Don't allow deleting default group
    setGroups(groups.filter(g => g.id !== groupId));
  };

  const handleMoveAquarium = (aquariumId: string, fromGroupId: string, toGroupId: string) => {
    setGroups(groups.map(group => {
      if (group.id === fromGroupId) {
        return {
          ...group,
          aquariumIds: group.aquariumIds.filter(id => id !== aquariumId)
        };
      }
      if (group.id === toGroupId) {
        return {
          ...group,
          aquariumIds: [...group.aquariumIds, aquariumId]
        };
      }
      return group;
    }));
  };

  const getAquariumsForGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return [];
    
    if (groupId === "default") {
      // Default group shows all ungrouped aquariums
      const groupedAquariumIds = groups
        .filter(g => g.id !== "default")
        .flatMap(g => g.aquariumIds);
      return aquariums.filter(aq => !groupedAquariumIds.includes(aq.id));
    }
    
    return aquariums.filter(aq => group.aquariumIds.includes(aq.id));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{sectionTitle}</h1>
        <div className="flex gap-2">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Aquarium Management Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="section-title">Section Title</Label>
                  <Input
                    id="section-title"
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    placeholder="My Aquariums"
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Manage Groups</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-group-name">Create New Group</Label>
                    <Input
                      id="new-group-name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Group name"
                    />
                    <Textarea
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      placeholder="Group description (optional)"
                      rows={2}
                    />
                    <Button onClick={handleCreateGroup} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Group
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Existing Groups</Label>
                    <div className="space-y-2">
                      {groups.map(group => (
                        <div key={group.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">{group.name}</span>
                            {group.description && (
                              <p className="text-sm text-muted-foreground">{group.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {getAquariumsForGroup(group.id).length} aquarium(s)
                            </p>
                          </div>
                          {group.id !== "default" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteGroup(group.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <CreateTankDialog aquariumCount={aquariumCount} />
        </div>
      </div>

      {groups.map(group => {
        const groupAquariums = getAquariumsForGroup(group.id);
        if (groupAquariums.length === 0 && group.id !== "default") return null;
        
        return (
          <div key={group.id} className="space-y-4">
            {groups.length > 1 && (
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-medium">{group.name}</h2>
                  {group.description && (
                    <p className="text-muted-foreground">{group.description}</p>
                  )}
                </div>
              </div>
            )}
            
            {groupAquariums.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {groupAquariums.map(tank => (
                  <div key={tank.id} className="space-y-2">
                    <TankCard
                      id={tank.id}
                      name={tank.name}
                      type={tank.type || 'N/A'}
                      size={tank.size || 0}
                      image_url={tank.image_url}
                      onDelete={onDeleteAquarium}
                    />
                    {groups.length > 1 && (
                      <Select
                        value={group.id}
                        onValueChange={(newGroupId) => handleMoveAquarium(tank.id, group.id, newGroupId)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {groups.map(g => (
                            <SelectItem key={g.id} value={g.id}>
                              {g.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              </div>
            ) : group.id === "default" && aquariums.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <h2 className="text-xl font-semibold">No Aquariums Yet</h2>
                <p className="text-muted-foreground mt-2">Get started by creating your first tank.</p>
                <div className="mt-4">
                  <CreateTankDialog aquariumCount={aquariumCount} />
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
