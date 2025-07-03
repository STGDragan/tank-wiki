
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-display font-semibold text-primary mb-4">TankWiki</h3>
            <p className="text-muted-foreground text-sm font-mono">
              Your comprehensive aquarium management platform for the digital age.
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-display font-semibold text-foreground mb-3">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/knowledge-base" className="text-muted-foreground hover:text-primary text-sm font-mono transition-colors">
                  Knowledge Base
                </Link>
              </li>
              <li>
                <Link to="/shopping" className="text-muted-foreground hover:text-primary text-sm font-mono transition-colors">
                  Shopping
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-muted-foreground hover:text-primary text-sm font-mono transition-colors">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-display font-semibold text-foreground mb-3">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-primary text-sm font-mono transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/account" className="text-muted-foreground hover:text-primary text-sm font-mono transition-colors">
                  Settings
                </Link>
              </li>
              <li>
                <Link to="/shared-with-me" className="text-muted-foreground hover:text-primary text-sm font-mono transition-colors">
                  Shared Tanks
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-display font-semibold text-foreground mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/legal/privacy" className="text-muted-foreground hover:text-primary text-sm font-mono transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/legal/terms" className="text-muted-foreground hover:text-primary text-sm font-mono transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/upgrade" className="text-muted-foreground hover:text-primary text-sm font-mono transition-colors">
                  Upgrade to Pro
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/30 mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm font-mono">
            © 2024 TankWiki. All rights reserved. | Powered by the aquarium community.
          </p>
        </div>
      </div>
    </footer>
  );
};
