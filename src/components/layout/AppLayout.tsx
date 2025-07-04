
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { Footer } from "./Footer";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
          <Footer />
        </div>
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}
