
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isAppInstalled);

    // Check if banner was previously dismissed
    const bannerDismissed = localStorage.getItem('installBannerDismissed');
    const dismissedTime = bannerDismissed ? parseInt(bannerDismissed) : 0;
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

    // Only show on mobile and if not installed and not recently dismissed
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile && !isAppInstalled && dismissedTime < oneDayAgo) {
      setShowBanner(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowBanner(false);
    } else {
      // Fallback for iOS Safari
      setShowIOSInstructions(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('installBannerDismissed', Date.now().toString());
  };

  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  if (isInstalled || !showBanner) {
    return null;
  }

  if (showIOSInstructions) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur border-t md:hidden">
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Smartphone className="h-5 w-5 mt-0.5 text-primary" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-2">Install Tank Wiki</h3>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>1. Tap the Share button in Safari</p>
                <p>2. Scroll and tap "Add to Home Screen"</p>
                <p>3. Tap "Add" to install the app</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowIOSInstructions(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur border-t md:hidden">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Download className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">Install Tank Wiki</h3>
            <p className="text-xs text-muted-foreground">
              Get quick access and work offline
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleInstallClick}
            >
              Install
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
