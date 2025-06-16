
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { InstallBanner } from "../mobile/InstallBanner";

export const AppLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 md:hidden">
            <SidebarTrigger className="-ml-1" />
          </header>
          <main className="flex-1 pb-16 md:pb-0 w-full">
            <Outlet />
          </main>
          <MobileBottomNav />
          <InstallBanner />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
