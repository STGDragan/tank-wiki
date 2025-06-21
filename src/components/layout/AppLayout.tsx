
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { InstallBanner } from "../mobile/InstallBanner";
import SocialMediaFooter from "./SocialMediaFooter";
import MobileInstructions from "./MobileInstructions";

export const AppLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 md:hidden">
            <SidebarTrigger className="-ml-1" />
          </header>
          <main className="flex-1 overflow-auto pb-32 md:pb-16">
            <Outlet />
          </main>
          <footer className="hidden md:block border-t bg-background p-4 space-y-4">
            <SocialMediaFooter />
            <MobileInstructions />
          </footer>
          <MobileBottomNav />
          <InstallBanner />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
