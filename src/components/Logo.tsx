
import { Fish } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Fish className="h-6 w-6 text-primary" />
      <span className="font-semibold text-lg text-foreground">TankWiki</span>
    </div>
  );
}
