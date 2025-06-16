
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ShoppingCart, Book, Users, Settings } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Shared", href: "/shared-with-me", icon: Users },
  { name: "Shopping", href: "/shopping", icon: ShoppingCart },
  { name: "Knowledge", href: "/knowledge-base", icon: Book },
  { name: "Settings", href: "/account", icon: Settings },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="overflow-x-auto">
        <div className="flex min-w-max justify-around items-center py-2 px-4">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className={cn(
                "flex flex-col items-center justify-center h-12 min-w-16 px-2 text-xs",
                location.pathname.startsWith(item.href) 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
              asChild
            >
              <Link to={item.href}>
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs leading-none whitespace-nowrap">{item.name}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
