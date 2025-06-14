
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/sonner";

export function AppLayout() {
  return (
    <div className="min-h-screen w-full flex bg-muted/40">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
