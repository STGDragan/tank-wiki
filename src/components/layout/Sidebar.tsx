
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Settings, ShoppingCart, Shield, LogOut, Book, Image as ImageIcon, FileText, Users, Menu } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { ScrollArea } from "../ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const mainNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Shared With Me", href: "/shared-with-me", icon: Users },
  { name: "Shopping", href: "/shopping", icon: ShoppingCart },
  { name: "Knowledge Base", href: "/knowledge-base", icon: Book },
];

const adminNav = [
    { name: "Products", href: "/admin/products", icon: Shield },
    { name: "Knowledge Base", href: "/admin/knowledge-base", icon: Book },
    { name: "Slideshow", href: "/admin/slideshow", icon: ImageIcon },
    { name: "Legal", href: "/admin/legal", icon: FileText },
];

export function Sidebar() {
  const location = useLocation();
  const { roles } = useAuth();
  const isAdmin = roles?.includes("admin");
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    setIsMobileOpen(false);
  };

  const renderNav = (items: typeof mainNav) => (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.name}>
          <Button
            variant={location.pathname.startsWith(item.href) ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
            onClick={() => setIsMobileOpen(false)}
          >
            <Link to={item.href}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </Link>
          </Button>
        </li>
      ))}
    </ul>
  );

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b">
        <Logo />
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <nav>{renderNav(mainNav)}</nav>
          {isAdmin && (
            <div>
              <h3 className="mb-2 px-4 text-sm font-semibold tracking-tight">
                Management
              </h3>
              <nav>{renderNav(adminNav)}</nav>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <Button
          variant={location.pathname.startsWith("/account") ? "secondary" : "ghost"}
          className="w-full justify-start"
          asChild
          onClick={() => setIsMobileOpen(false)}
        >
          <Link to="/account">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50 md:hidden">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <div className="flex flex-col h-full bg-background">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-background">
        <SidebarContent />
      </aside>
    </>
  );
}
