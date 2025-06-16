
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { InstallBanner } from "../mobile/InstallBanner";

export const AppLayout = () => {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 pb-16 md:pb-0">
          <Outlet />
        </div>
        <MobileBottomNav />
        <InstallBanner />
      </main>
    </div>
  );
};
