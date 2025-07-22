
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { Footer } from "./Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";

export function AppLayout() {
  const { isMobile } = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <SidebarInset className="flex-1 flex flex-col">
          {/* Mobile header with menu trigger */}
          <header className="md:hidden flex h-12 items-center border-b bg-background px-4">
            <SidebarTrigger className="p-2 hover:bg-accent">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
          </header>
          
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
          <Footer />
        </SidebarInset>
        
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}
