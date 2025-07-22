
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Bell, Clock, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { Tables } from '@/integrations/supabase/types';

interface NotificationPreferences {
  email_enabled: boolean;
  notification_time: string;
  timezone: string;
}

interface NotificationsCardProps {
  profile: Tables<'profiles'> | null;
  isLoading: boolean;
}

const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central European Time' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time' },
  { value: 'Asia/Shanghai', label: 'China Standard Time' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time' },
  { value: 'Pacific/Auckland', label: 'New Zealand Standard Time' },
];

export function NotificationsCard({ profile, isLoading: profileLoading }: NotificationsCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_enabled: true,
    notification_time: '18:00',
    timezone: 'UTC'
  });

  useEffect(() => {
    if (user?.id && !profileLoading) {
      loadPreferences();
    }
  }, [user?.id, profileLoading]);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_notification_preferences')
        .select('email_enabled, notification_time, timezone')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          email_enabled: data.email_enabled ?? profile?.enable_maintenance_notifications ?? true,
          notification_time: data.notification_time?.substring(0, 5) || '18:00',
          timezone: data.timezone || 'UTC'
        });
      } else {
        // Use profile settings as fallback
        setPreferences(prev => ({
          ...prev,
          email_enabled: profile?.enable_maintenance_notifications ?? true
        }));
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      // Update both the notification preferences and the profile
      const [notificationResult, profileResult] = await Promise.allSettled([
        supabase
          .from('maintenance_notification_preferences')
          .upsert({
            user_id: user.id,
            email_enabled: preferences.email_enabled,
            notification_time: preferences.notification_time + ':00',
            timezone: preferences.timezone
          }),
        supabase
          .from('profiles')
          .update({ 
            enable_maintenance_notifications: preferences.email_enabled,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
      ]);

      // Check if either operation failed
      if (notificationResult.status === 'rejected') {
        throw notificationResult.reason;
      }
      if (profileResult.status === 'rejected') {
        throw profileResult.reason;
      }

      toast({
        title: 'Preferences Updated',
        description: 'Your notification preferences have been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTimeChange = (value: string) => {
    setPreferences(prev => ({ ...prev, notification_time: value }));
  };

  const handleTimezoneChange = (value: string) => {
    setPreferences(prev => ({ ...prev, timezone: value }));
  };

  const handleEmailToggle = (checked: boolean) => {
    setPreferences(prev => ({ ...prev, email_enabled: checked }));
  };

  if (loading || profileLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Configure when and how you receive maintenance reminders. 
          Notifications are now sent at your preferred time in your local timezone.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive maintenance reminders via email
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={preferences.email_enabled}
            onCheckedChange={handleEmailToggle}
          />
        </div>

        {preferences.email_enabled && (
          <>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Notification Time
              </Label>
              <Input
                type="time"
                value={preferences.notification_time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Choose when you'd like to receive daily maintenance reminders. 
                Default is 6:00 PM in your timezone.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Timezone
              </Label>
              <Select value={preferences.timezone} onValueChange={handleTimezoneChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Select your local timezone for accurate notification scheduling.
              </p>
            </div>
          </>
        )}

        <div className="pt-4">
          <Button 
            onClick={savePreferences} 
            disabled={saving}
            className="w-full"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-2">How it works:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Notifications are checked every 30 minutes</li>
            <li>• You'll only receive emails if you have upcoming or overdue maintenance tasks</li>
            <li>• Upcoming tasks are those due within the next 7 days</li>
            <li>• Overdue tasks are those past their due date</li>
            <li>• Notifications respect your timezone and preferred time</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
