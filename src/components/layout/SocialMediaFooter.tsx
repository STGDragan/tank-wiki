
import React from "react";
import { Button } from "@/components/ui/button";
import { useSocialMediaLinks } from "@/hooks/useSocialMedia";
import { Mail, Facebook, Instagram, Youtube } from "lucide-react";

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
    colorClass: 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
  },
  facebook: { 
    label: 'Facebook', 
    icon: Facebook,
    colorClass: 'text-blue-600 hover:text-white hover:bg-blue-600'
  },
  instagram: { 
    label: 'Instagram', 
    icon: Instagram,
    colorClass: 'text-pink-600 hover:text-white hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600'
  },
  tiktok: { 
    label: 'TikTok', 
    icon: TikTokIcon,
    colorClass: 'text-black hover:text-white hover:bg-black'
  },
  youtube: { 
    label: 'YouTube', 
    icon: Youtube,
    colorClass: 'text-red-600 hover:text-white hover:bg-red-600'
  }
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
            className={`p-2 h-10 w-10 rounded-full transition-all duration-200 ${config.colorClass}`}
            onClick={() => handleClick(link.url)}
            title={`Visit our ${config.label}`}
          >
            <Icon className="h-5 w-5" />
          </Button>
        );
      })}
    </div>
  );
};

export default SocialMediaFooter;
