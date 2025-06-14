
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AppLayout() {
  return (
    <div className="h-screen w-full flex bg-muted/40">
      <Sidebar />
      <ScrollArea className="flex-1">
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </ScrollArea>
      <Toaster />
    </div>
  );
}
