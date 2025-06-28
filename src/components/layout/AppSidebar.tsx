
import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Settings, ShoppingCart, Shield, Book, Image as ImageIcon, FileText, Users, MessageSquare, Crown, UserCog, Share2, Mail, Facebook, Instagram, Youtube } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useSocialMediaLinks } from "@/hooks/useSocialMedia";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const mainNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Shared Tanks", href: "/shared-with-me", icon: Users },
  { name: "Shopping", href: "/shopping", icon: ShoppingCart },
  { name: "Knowledge Base", href: "/knowledge-base", icon: Book },
  { name: "Feedback", href: "/feedback", icon: MessageSquare },
];

const adminNav = [
  { name: "Products", href: "/admin/products", icon: Shield },
  { name: "Knowledge Base", href: "/admin/knowledge-base", icon: Book },
  { name: "Slideshow", href: "/admin/slideshow", icon: ImageIcon },
  { name: "Legal", href: "/admin/legal", icon: FileText },
  { name: "Feedback", href: "/admin/feedback", icon: MessageSquare },
  { name: "Subscriptions", href: "/admin/subscriptions", icon: Crown },
  { name: "Admin Management", href: "/admin/management", icon: UserCog },
  { name: "Social Media", href: "/admin/social-media", icon: Share2 },
];

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
  email: { label: 'Email', icon: Mail },
  facebook: { label: 'Facebook', icon: Facebook },
  instagram: { label: 'Instagram', icon: Instagram },
  tiktok: { label: 'TikTok', icon: TikTokIcon },
  youtube: { label: 'YouTube', icon: Youtube }
};

export function AppSidebar() {
  const location = useLocation();
  const { roles } = useAuth();
  const isAdmin = roles?.includes("admin");
  const { data: socialLinks } = useSocialMediaLinks();

  const handleSocialClick = (url: string) => {
    if (url.startsWith('mailto:')) {
      window.location.href = url;
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Sidebar className="w-64 border-r">
      <SidebarHeader className="p-4">
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={location.pathname.startsWith(item.href)}>
                    <Link to={item.href} className="flex items-center gap-3 px-3 py-2">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-3">Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNav.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={location.pathname.startsWith(item.href)}>
                      <Link to={item.href} className="flex items-center gap-3 px-3 py-2">
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {socialLinks && socialLinks.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="px-3">Follow Us</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {socialLinks.map((link) => {
                    const config = platformConfig[link.platform];
                    if (!config) return null;
                    
                    const Icon = config.icon;
                    
                    return (
                      <SidebarMenuItem key={link.platform}>
                        <SidebarMenuButton onClick={() => handleSocialClick(link.url)} className="flex items-center gap-3 px-3 py-2">
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{config.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname.startsWith("/account")}>
              <Link to="/account" className="flex items-center gap-3 px-3 py-2">
                <Settings className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
