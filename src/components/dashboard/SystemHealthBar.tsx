
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

export const SystemHealthBar = () => {
  const { user } = useAuth();

  // Mock health calculation for now - you can expand this with real data
  const { data: healthScore = 85 } = useQuery({
    queryKey: ["system-health", user?.id],
    queryFn: async () => {
      // This would calculate based on water parameters, maintenance tasks, etc.
      return 85; // Mock value
    },
    enabled: !!user?.id,
  });

  const getHealthColor = (score: number) => {
    if (score >= 80) return "from-green-400 to-green-600";
    if (score >= 60) return "from-yellow-400 to-yellow-600";
    return "from-red-400 to-red-600";
  };

  const getGlowColor = (score: number) => {
    if (score >= 80) return "shadow-green-400/60";
    if (score >= 60) return "shadow-yellow-400/60";
    return "shadow-red-400/60";
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2">
          <span className="text-cyan-400">◉</span>
          SYSTEM HEALTH STATUS
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-8 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
          {/* Full gradient background - red to yellow to green across entire width */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 opacity-20" />
          
          {/* Health bar fill with LED-like brightness */}
          <div 
            className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getHealthColor(healthScore)} transition-all duration-1000 ease-out ${getGlowColor(healthScore)} shadow-lg brightness-125`}
            style={{ width: `${healthScore}%` }}
          />
          
          {/* Animated LED glow effect */}
          <div 
            className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getHealthColor(healthScore)} opacity-80 blur-sm transition-all duration-1000 ease-out brightness-150`}
            style={{ width: `${healthScore}%` }}
          />
          
          {/* Sci-fi grid overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          {/* Score indicator */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-6 bg-white rounded-sm border-2 border-gray-300 shadow-lg transition-all duration-1000 ease-out"
            style={{ left: `calc(${healthScore}% - 6px)` }}
          />
        </div>
        
        <div className="flex justify-between items-center mt-4 text-sm">
          <span className="text-red-400 font-mono">CRITICAL</span>
          <span className="text-yellow-400 font-mono">CAUTION</span>
          <span className="text-green-400 font-mono">OPTIMAL</span>
        </div>
        
        <div className="text-center mt-2">
          <span className="text-2xl font-mono text-white">{healthScore}%</span>
          <span className="text-gray-400 ml-2">SYSTEM EFFICIENCY</span>
        </div>
      </CardContent>
    </Card>
  );
};
