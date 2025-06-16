
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { InstallBanner } from "../mobile/InstallBanner";

export const AppLayout = () => {
  return (
    <div className="min-h-screen flex bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        <div className="flex-1 pb-16 md:pb-0 w-full">
          <Outlet />
        </div>
        <MobileBottomNav />
        <InstallBanner />
      </main>
    </div>
  );
};
