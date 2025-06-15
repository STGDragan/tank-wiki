
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AppLayout() {
  return (
    <div className="h-screen w-full flex bg-muted/40">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <ScrollArea className="flex-1">
          <main className="p-4 sm:p-6 pt-16 md:pt-4">
            <Outlet />
          </main>
        </ScrollArea>
      </div>
      <Toaster />
    </div>
  );
}
