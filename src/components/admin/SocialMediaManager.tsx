
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllSocialMediaLinks, useUpsertSocialMediaLink } from "@/hooks/useSocialMedia";
import { Mail, Facebook, Instagram, Youtube } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// TikTok icon component since it's not in lucide-react
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const platformConfig = {
  email: { 
    label: 'Email', 
    icon: Mail, 
    placeholder: 'mailto:OriginalTankWiki@gmail.com',
    colorClass: 'text-gray-600'
  },
  facebook: { 
    label: 'Facebook', 
    icon: Facebook, 
    placeholder: 'https://facebook.com/tankwiki',
    colorClass: 'text-blue-600'
  },
  instagram: { 
    label: 'Instagram', 
    icon: Instagram, 
    placeholder: 'https://instagram.com/tankwiki',
    colorClass: 'text-pink-600'
  },
  tiktok: { 
    label: 'TikTok', 
    icon: TikTokIcon, 
    placeholder: 'https://tiktok.com/@tankwiki',
    colorClass: 'text-black'
  },
  youtube: { 
    label: 'YouTube', 
    icon: Youtube, 
    placeholder: 'https://youtube.com/@tankwiki',
    colorClass: 'text-red-600'
  }
};

const SocialMediaManager = () => {
  const { data: socialLinks, isLoading } = useAllSocialMediaLinks();
  const upsertMutation = useUpsertSocialMediaLink();
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [formData, setFormData] = useState({ url: '', is_active: false });

  const handleEdit = (platform: string) => {
    const existing = socialLinks?.find(link => link.platform === platform);
    setEditingPlatform(platform);
    setFormData({
      url: existing?.url || '',
      is_active: existing?.is_active || false
    });
  };

  const handleSave = async () => {
    if (!editingPlatform) return;
    
    await upsertMutation.mutateAsync({
      platform: editingPlatform,
      url: formData.url,
      is_active: formData.is_active && formData.url.trim() !== ''
    });
    
    setEditingPlatform(null);
    setFormData({ url: '', is_active: false });
  };

  const handleCancel = () => {
    setEditingPlatform(null);
    setFormData({ url: '', is_active: false });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Social Media Links</h1>
          <p className="text-muted-foreground">Manage your social media presence</p>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Social Media Links</h1>
        <p className="text-muted-foreground">
          Manage your social media links that appear in the footer
        </p>
      </div>

      <div className="grid gap-4">
        {Object.entries(platformConfig).map(([platform, config]) => {
          const existing = socialLinks?.find(link => link.platform === platform);
          const Icon = config.icon;
          const isEditing = editingPlatform === platform;

          return (
            <Card key={platform}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${config.colorClass}`} />
                    <CardTitle className="text-lg">{config.label}</CardTitle>
                    {existing?.is_active && (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    )}
                  </div>
                  {!isEditing && (
                    <Button
                      onClick={() => handleEdit(platform)}
                      variant="outline"
                      size="sm"
                    >
                      {existing ? 'Edit' : 'Add'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${platform}-url`}>URL</Label>
                      <Input
                        id={`${platform}-url`}
                        placeholder={config.placeholder}
                        value={formData.url}
                        onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`${platform}-active`}
                        checked={formData.is_active && formData.url.trim() !== ''}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                        disabled={formData.url.trim() === ''}
                      />
                      <Label htmlFor={`${platform}-active`}>Show in footer</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={upsertMutation.isPending}
                        size="sm"
                      >
                        {upsertMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {existing?.url ? (
                      <p className="text-sm text-muted-foreground break-all">
                        {existing.url}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No URL configured
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SocialMediaManager;
