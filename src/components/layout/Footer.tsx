
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">TankWiki</h3>
            <p className="text-gray-400 text-sm">
              Your comprehensive aquarium management platform.
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-semibold text-white mb-3">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/knowledge-base" className="text-gray-400 hover:text-cyan-400 text-sm">
                  Knowledge Base
                </Link>
              </li>
              <li>
                <Link to="/shopping" className="text-gray-400 hover:text-cyan-400 text-sm">
                  Shopping
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-gray-400 hover:text-cyan-400 text-sm">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-semibold text-white mb-3">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-cyan-400 text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/account" className="text-gray-400 hover:text-cyan-400 text-sm">
                  Settings
                </Link>
              </li>
              <li>
                <Link to="/shared-with-me" className="text-gray-400 hover:text-cyan-400 text-sm">
                  Shared Tanks
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/legal/privacy" className="text-gray-400 hover:text-cyan-400 text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/legal/terms" className="text-gray-400 hover:text-cyan-400 text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 TankWiki. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
