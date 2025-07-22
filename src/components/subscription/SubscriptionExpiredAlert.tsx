import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Crown, ExternalLink, RefreshCw, X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useState, useEffect } from 'react';

interface SubscriptionExpiredAlertProps {
  reason?: string;
  previousTier?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function SubscriptionExpiredAlert({ 
  reason = 'payment_failed',
  previousTier,
  onRefresh,
  isRefreshing = false,
  className = ""
}: SubscriptionExpiredAlertProps) {
  const { hasActiveSubscription, user } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if alert was dismissed for current subscription status
  useEffect(() => {
    if (user?.id) {
      const dismissKey = `subscription-alert-dismissed-${user.id}-${hasActiveSubscription}`;
      const wasDismissed = localStorage.getItem(dismissKey) === 'true';
      setIsDismissed(wasDismissed);
    }
  }, [user?.id, hasActiveSubscription]);

  const handleClose = () => {
    if (user?.id) {
      const dismissKey = `subscription-alert-dismissed-${user.id}-${hasActiveSubscription}`;
      localStorage.setItem(dismissKey, 'true');
      setIsDismissed(true);
    }
  };

  const handleResubscribe = () => {
    window.open('/pro', '_blank');
  };

  const getReasonMessage = () => {
    switch (reason) {
      case 'payment_failed':
        return 'Your payment could not be processed.';
      case 'cancelled':
        return 'Your subscription was cancelled.';
      case 'expired':
        return 'Your subscription has expired.';
      default:
        return 'Your subscription is no longer active.';
    }
  };

  if (hasActiveSubscription || isDismissed) {
    return null; // Don't show if user has active subscription or dismissed
  }

  return (
    <Card className={`border-amber-500/50 bg-amber-950/20 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-amber-200">Subscription Required</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 text-amber-400 hover:text-amber-200 hover:bg-amber-950/30"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-amber-300/80">
          {getReasonMessage()} {previousTier && `Your ${previousTier} plan benefits are no longer available.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="border-amber-500/30 bg-amber-950/30 mb-4">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-200">
            Some features are now limited or unavailable. Resubscribe to restore full access to all Pro features.
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleResubscribe}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Crown className="mr-2 h-4 w-4" />
            Resubscribe to Pro
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
          
          {onRefresh && (
            <Button 
              variant="outline" 
              onClick={onRefresh}
              disabled={isRefreshing}
              className="border-amber-500 text-amber-500 hover:bg-amber-950/20"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}