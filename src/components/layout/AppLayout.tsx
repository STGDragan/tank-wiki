
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { Footer } from "./Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppLayout() {
  const { isMobile } = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        
        {/* Main content area */}
        <SidebarInset className="flex-1 flex flex-col">
          {/* Mobile header with menu trigger */}
          <header className="md:hidden flex h-12 items-center border-b bg-background px-4">
            <SidebarTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SidebarTrigger>
          </header>
          
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
          <Footer />
        </SidebarInset>
        
        {/* Mobile Sidebar - Only shows on mobile when triggered */}
        <div className="md:hidden">
          <AppSidebar />
        </div>
        
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}
