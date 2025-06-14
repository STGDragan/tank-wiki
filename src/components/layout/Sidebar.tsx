
import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Settings, UserCircle, ShoppingCart } from "lucide-react";

const mainNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Shopping", href: "/shopping", icon: ShoppingCart },
];

const secondaryNav = [
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  const renderNav = (items: typeof mainNav) => (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.name}>
          <Button
            variant={location.pathname.startsWith(item.href) ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
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

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-background">
      <div className="p-4 border-b">
        <Logo />
      </div>
      <div className="flex-1 p-4 space-y-6">
        <nav>{renderNav(mainNav)}</nav>
        <nav>{renderNav(secondaryNav)}</nav>
      </div>
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start">
            <UserCircle className="mr-2 h-4 w-4" />
            My Account
        </Button>
      </div>
    </aside>
  );
}
