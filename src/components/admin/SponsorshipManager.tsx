
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Plus, Edit, Trash2 } from "lucide-react";

interface SponsorshipData {
  id: string;
  key: string;
  value: string;
  description?: string;
}

const fetchSponsorshipSettings = async () => {
  const { data, error } = await supabase
    .from("cms_settings")
    .select("*")
    .like("key", "sponsorship_%")
    .order("key");

  if (error) throw error;
  return data as SponsorshipData[];
};

export const SponsorshipManager = () => {
  const [newSetting, setNewSetting] = useState({ key: "", value: "", description: "" });
  const [editingSetting, setEditingSetting] = useState<SponsorshipData | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["sponsorship-settings"],
    queryFn: fetchSponsorshipSettings,
  });

  const addSettingMutation = useMutation({
    mutationFn: async (setting: { key: string; value: string; description?: string }) => {
      const { error } = await supabase.from('cms_settings').insert([{
        key: `sponsorship_${setting.key}`,
        value: setting.value,
        description: setting.description
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsorship-settings'] });
      toast({ title: 'Sponsorship Setting Added', description: 'New setting has been created.' });
      setNewSetting({ key: "", value: "", description: "" });
    },
    onError: (error: Error) => {
      toast({ title: 'Error adding setting', description: error.message, variant: 'destructive' });
    }
  });

  const updateSettingMutation = useMutation({
    mutationFn: async (setting: SponsorshipData) => {
      const { error } = await supabase
        .from('cms_settings')
        .update({
          value: setting.value,
          description: setting.description
        })
        .eq('id', setting.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsorship-settings'] });
      toast({ title: 'Setting Updated', description: 'Sponsorship setting has been updated.' });
      setEditingSetting(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating setting', description: error.message, variant: 'destructive' });
    }
  });

  const deleteSettingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cms_settings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsorship-settings'] });
      toast({ title: 'Setting Deleted', description: 'Sponsorship setting has been removed.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting setting', description: error.message, variant: 'destructive' });
    }
  });

  const handleAddSetting = () => {
    if (!newSetting.key.trim() || !newSetting.value.trim()) {
      toast({ title: 'Missing fields', description: 'Key and value are required.', variant: 'destructive' });
      return;
    }
    addSettingMutation.mutate(newSetting);
  };

  const handleUpdateSetting = () => {
    if (!editingSetting) return;
    updateSettingMutation.mutate(editingSetting);
  };

  return (
    <div className="space-y-6">
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Megaphone className="h-5 w-5 text-primary" />
            Sponsorship Management Console
          </CardTitle>
          <CardDescription className="font-mono">
            Configure sponsorship banners, affiliate codes, and promotional content across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="cyber-grid grid-cols-3">
            <div className="space-y-2">
              <Label className="font-display text-primary">Setting Key</Label>
              <Input
                value={newSetting.key}
                onChange={(e) => setNewSetting(prev => ({ ...prev, key: e.target.value }))}
                placeholder="banner_text"
                className="cyber-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-display text-primary">Value</Label>
              <Input
                value={newSetting.value}
                onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Special offer text..."
                className="cyber-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-display text-primary">Description</Label>
              <Input
                value={newSetting.description}
                onChange={(e) => setNewSetting(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What this setting controls"
                className="cyber-input"
              />
            </div>
          </div>
          
          <Button onClick={handleAddSetting} disabled={addSettingMutation.isPending} className="cyber-button">
            <Plus className="h-4 w-4 mr-2" />
            Add Sponsorship Setting
          </Button>
        </CardContent>
      </Card>

      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="font-display">Current Sponsorship Settings</CardTitle>
          <CardDescription className="font-mono">
            Manage existing sponsorship configurations and promotional content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 font-mono">Loading sponsorship settings...</div>
            ) : settings && settings.length > 0 ? (
              settings.map((setting) => (
                <Card key={setting.id} className="p-4 glass-panel neon-border">
                  {editingSetting?.id === setting.id ? (
                    <div className="space-y-4">
                      <div className="cyber-grid grid-cols-2">
                        <div className="space-y-2">
                          <Label className="font-mono text-primary">Value</Label>
                          <Textarea
                            value={editingSetting.value}
                            onChange={(e) => setEditingSetting(prev => prev ? ({ ...prev, value: e.target.value }) : null)}
                            className="cyber-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-mono text-primary">Description</Label>
                          <Input
                            value={editingSetting.description || ""}
                            onChange={(e) => setEditingSetting(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                            className="cyber-input"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleUpdateSetting} size="sm" className="cyber-button">
                          Save Changes
                        </Button>
                        <Button onClick={() => setEditingSetting(null)} size="sm" variant="outline" className="cyber-button">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">{setting.key}</Badge>
                        </div>
                        <p className="font-mono text-sm">{setting.value}</p>
                        {setting.description && (
                          <p className="text-xs text-muted-foreground font-mono">{setting.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setEditingSetting(setting)}
                          size="sm"
                          variant="outline"
                          className="cyber-button"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => deleteSettingMutation.mutate(setting.id)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground font-mono">
                No sponsorship settings configured yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
