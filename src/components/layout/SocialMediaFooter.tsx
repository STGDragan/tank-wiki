
import React from "react";
import { Button } from "@/components/ui/button";
import { useSocialMediaLinks } from "@/hooks/useSocialMedia";
import { Mail, Facebook, Instagram, Youtube, ExternalLink } from "lucide-react";

const platformConfig = {
  email: { label: 'Email', icon: Mail },
  facebook: { label: 'Facebook', icon: Facebook },
  instagram: { label: 'Instagram', icon: Instagram },
  tiktok: { label: 'TikTok', icon: ExternalLink },
  youtube: { label: 'YouTube', icon: Youtube }
};

const SocialMediaFooter = () => {
  const { data: socialLinks } = useSocialMediaLinks();

  if (!socialLinks || socialLinks.length === 0) {
    return null;
  }

  const handleClick = (url: string) => {
    if (url.startsWith('mailto:')) {
      window.location.href = url;
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <span className="text-sm text-muted-foreground mr-2">Follow us:</span>
      {socialLinks.map((link) => {
        const config = platformConfig[link.platform];
        if (!config) return null;
        
        const Icon = config.icon;
        
        return (
          <Button
            key={link.platform}
            variant="ghost"
            size="sm"
            className="p-2 h-8 w-8 rounded-full hover:bg-muted transition-colors"
            onClick={() => handleClick(link.url)}
            title={`Visit our ${config.label}`}
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
    </div>
  );
};

export default SocialMediaFooter;
