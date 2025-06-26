
import { AdminRoute } from "@/components/admin/AdminRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Settings, Wand2, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminProducts = () => {
  const navigate = useNavigate();

  return (
    <AdminRoute>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-display font-bold neon-text">PRODUCT MANAGEMENT HUB</h1>
          <p className="text-muted-foreground font-mono text-lg">Advanced control systems for product management and commerce operations</p>
        </div>

        <div className="cyber-grid">
          <Card className="cyber-card hover:neon-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-primary">
                <ShoppingCart className="h-6 w-6" />
                Shopping Manager
              </CardTitle>
              <CardDescription className="font-mono">
                Complete product inventory management, visibility controls, and affiliate settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/admin/shopping-manager')} 
                className="w-full cyber-button"
              >
                ACCESS SHOPPING CONSOLE
              </Button>
            </CardContent>
          </Card>

          <Card className="cyber-card hover:neon-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-primary">
                <Wand2 className="h-6 w-6" />
                Wizard Integration
              </CardTitle>
              <CardDescription className="font-mono">
                Control which products appear in the setup wizard for new aquarium owners
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/admin/shopping-manager?tab=wizard')} 
                className="w-full cyber-button"
              >
                CONFIGURE WIZARD
              </Button>
            </CardContent>
          </Card>

          <Card className="cyber-card hover:neon-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-primary">
                <Crown className="h-6 w-6" />
                Sponsorship Manager
              </CardTitle>
              <CardDescription className="font-mono">
                Manage sponsored content and promotional placements across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/admin/shopping-manager?tab=sponsorship')} 
                className="w-full cyber-button"
              >
                MANAGE SPONSORS
              </Button>
            </CardContent>
          </Card>

          <Card className="cyber-card hover:neon-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-primary">
                <Settings className="h-6 w-6" />
                Visibility Controls
              </CardTitle>
              <CardDescription className="font-mono">
                Advanced visibility management for homepage, shop, and featured sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/admin/shopping-manager?tab=visibility')} 
                className="w-full cyber-button"
              >
                CONTROL VISIBILITY
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="glass-panel p-6 neon-border">
          <h3 className="font-display text-primary mb-4">System Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">∞</div>
              <div className="text-muted-foreground">Active Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">∞</div>
              <div className="text-muted-foreground">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">∞</div>
              <div className="text-muted-foreground">Featured Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">∞</div>
              <div className="text-muted-foreground">Wizard Items</div>
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminProducts;
