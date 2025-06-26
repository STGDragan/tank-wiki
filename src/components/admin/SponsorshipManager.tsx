
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Crown, Plus, Edit, Trash2, ExternalLink } from "lucide-react";

interface Sponsorship {
  id: string;
  title: string;
  description: string;
  sponsor_url: string;
  image_url?: string;
  is_active: boolean;
  priority: number;
}

export const SponsorshipManager = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sponsor_url: '',
    image_url: '',
    is_active: true,
    priority: 1
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for now - replace with actual query when sponsorship table exists
  const sponsorships: Sponsorship[] = [
    {
      id: '1',
      title: 'AquaClear Premium Filters',
      description: 'Advanced filtration systems for crystal clear water',
      sponsor_url: 'https://example.com/aquaclear',
      image_url: '/placeholder.svg',
      is_active: true,
      priority: 1
    },
    {
      id: '2', 
      title: 'TankMaster LED Lighting',
      description: 'Professional aquarium lighting solutions',
      sponsor_url: 'https://example.com/tankmaster',
      image_url: '/placeholder.svg',
      is_active: false,
      priority: 2
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation would go here when backend is ready
    toast({ 
      title: 'Sponsorship Saved', 
      description: 'Sponsorship has been updated successfully.' 
    });
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      sponsor_url: '',
      image_url: '',
      is_active: true,
      priority: 1
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (sponsorship: Sponsorship) => {
    setFormData({
      title: sponsorship.title,
      description: sponsorship.description,
      sponsor_url: sponsorship.sponsor_url,
      image_url: sponsorship.image_url || '',
      is_active: sponsorship.is_active,
      priority: sponsorship.priority
    });
    setEditingId(sponsorship.id);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    // Implementation would go here when backend is ready
    toast({ 
      title: 'Sponsorship Deleted', 
      description: 'Sponsorship has been removed successfully.' 
    });
  };

  const toggleActive = (id: string, isActive: boolean) => {
    // Implementation would go here when backend is ready
    toast({ 
      title: 'Status Updated', 
      description: `Sponsorship ${isActive ? 'activated' : 'deactivated'} successfully.` 
    });
  };

  return (
    <div className="space-y-6">
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Crown className="h-5 w-5 text-primary" />
            Sponsorship Management
          </CardTitle>
          <CardDescription className="font-mono">
            Manage sponsored content and promotional placements across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sponsorship Form */}
          <Card className="glass-panel neon-border">
            <CardHeader>
              <CardTitle className="text-lg font-display">
                {isEditing ? 'Edit Sponsorship' : 'Add New Sponsorship'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="font-display text-primary">Sponsor Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter sponsor title"
                      className="cyber-input"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sponsor_url" className="font-display text-primary">Sponsor URL</Label>
                    <Input
                      id="sponsor_url"
                      type="url"
                      value={formData.sponsor_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, sponsor_url: e.target.value }))}
                      placeholder="https://sponsor-website.com"
                      className="cyber-input"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="font-display text-primary">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the sponsorship"
                    className="cyber-input"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="image_url" className="font-display text-primary">Image URL</Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                      placeholder="https://example.com/sponsor-logo.jpg"
                      className="cyber-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority" className="font-display text-primary">Priority</Label>
                    <Input
                      id="priority"
                      type="number"
                      min="1"
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                      className="cyber-input"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active" className="font-mono">Active</Label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="cyber-button">
                    <Plus className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update Sponsorship' : 'Add Sponsorship'}
                  </Button>
                  {isEditing && (
                    <Button type="button" onClick={resetForm} variant="outline" className="cyber-button">
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Sponsorships List */}
          <div className="space-y-4">
            <h3 className="text-lg font-display text-primary">Active Sponsorships</h3>
            
            {sponsorships.map((sponsorship) => (
              <Card key={sponsorship.id} className="glass-panel neon-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {sponsorship.image_url && (
                        <img
                          src={sponsorship.image_url}
                          alt={sponsorship.title}
                          className="w-16 h-16 rounded-md object-cover neon-border"
                        />
                      )}
                      <div>
                        <h4 className="font-medium font-mono">{sponsorship.title}</h4>
                        <p className="text-sm text-muted-foreground font-mono">{sponsorship.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={sponsorship.is_active ? "default" : "secondary"} className="font-mono text-xs">
                            {sponsorship.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="font-mono text-xs">
                            Priority {sponsorship.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(sponsorship.sponsor_url, '_blank')}
                        className="cyber-button"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(sponsorship)}
                        className="cyber-button"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(sponsorship.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Switch
                        checked={sponsorship.is_active}
                        onCheckedChange={(checked) => toggleActive(sponsorship.id, checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
