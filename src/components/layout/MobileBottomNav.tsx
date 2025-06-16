
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ShoppingCart, Book, Users, Settings } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Shared", href: "/shared-with-me", icon: Users },
  { name: "Shopping", href: "/shopping", icon: ShoppingCart },
  { name: "Knowledge", href: "/knowledge-base", icon: Book },
  { name: "Settings", href: "/account", icon: Settings },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex justify-around items-center py-2 px-4">
        {navItems.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            className={cn(
              "flex flex-col items-center justify-center h-12 w-16 p-1 text-xs",
              location.pathname.startsWith(item.href) 
                ? "text-primary" 
                : "text-muted-foreground"
            )}
            asChild
          >
            <Link to={item.href}>
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs leading-none">{item.name}</span>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
