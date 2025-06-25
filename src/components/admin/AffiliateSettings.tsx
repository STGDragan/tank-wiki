
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save } from "lucide-react";

const AffiliateSettings = () => {
  const [affiliateTag, setAffiliateTag] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['affiliate-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_settings')
        .select('*')
        .eq('key', 'amazon_affiliate_tag')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  React.useEffect(() => {
    if (settings) {
      setAffiliateTag(settings.value || '');
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (newTag: string) => {
      const { error } = await supabase
        .from('cms_settings')
        .upsert({
          key: 'amazon_affiliate_tag',
          value: newTag,
          description: 'Default Amazon affiliate tag to append to product URLs'
        }, {
          onConflict: 'key'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-settings'] });
      toast({ 
        title: 'Settings Updated', 
        description: 'Amazon affiliate tag has been updated successfully.' 
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Error updating settings', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(affiliateTag.trim());
  };

  if (isLoading) {
    return (
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-primary">
            <Settings className="h-5 w-5 text-primary" />
            Affiliate Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-20 bg-muted/50 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cyber-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-primary">
          <Settings className="h-5 w-5 text-primary" />
          Amazon Affiliate Settings
        </CardTitle>
        <CardDescription className="font-mono text-muted-foreground">
          Configure your global Amazon affiliate tag. This will be automatically applied to all Amazon product URLs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="affiliate-tag" className="font-display text-primary">Amazon Affiliate Tag</Label>
            <Input
              id="affiliate-tag"
              value={affiliateTag}
              onChange={(e) => setAffiliateTag(e.target.value)}
              placeholder="your-affiliate-tag-20"
              className="max-w-md cyber-input"
            />
            <p className="text-sm text-muted-foreground font-mono">
              Enter your Amazon Associate tag (e.g., "yourname-20"). This will be appended to all Amazon product URLs.
            </p>
          </div>
          
          <Button 
            type="submit" 
            disabled={updateSettingsMutation.isPending}
            className="flex items-center gap-2 cyber-button"
          >
            <Save className="h-4 w-4" />
            {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </form>
        
        <div className="mt-6 p-4 glass-panel rounded-lg neon-border">
          <h4 className="font-medium mb-2 font-display text-primary">How it works:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 font-mono">
            <li>• When you add Amazon URLs to products, they're automatically formatted with your affiliate tag</li>
            <li>• The system extracts the ASIN (product ID) and creates clean affiliate URLs</li>
            <li>• Original Amazon URLs are preserved in the amazon_url field</li>
            <li>• Clean affiliate URLs are stored in the affiliate_url field</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AffiliateSettings;
