
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Bell, Clock, Globe, Calendar, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { Tables } from '@/integrations/supabase/types';

interface NotificationPreferences {
  email_enabled: boolean;
  notification_time: string;
  timezone: string;
  reminder_intervals: number[];
  advance_notifications_enabled: boolean;
  due_date_notifications_enabled: boolean;
  overdue_notifications_enabled: boolean;
  escalation_enabled: boolean;
  escalation_days: number;
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
    timezone: 'UTC',
    reminder_intervals: [7, 3, 1],
    advance_notifications_enabled: true,
    due_date_notifications_enabled: true,
    overdue_notifications_enabled: true,
    escalation_enabled: false,
    escalation_days: 3
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
        .select('email_enabled, notification_time, timezone, reminder_intervals, advance_notifications_enabled, due_date_notifications_enabled, overdue_notifications_enabled, escalation_enabled, escalation_days')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          email_enabled: data.email_enabled ?? profile?.enable_maintenance_notifications ?? true,
          notification_time: data.notification_time?.substring(0, 5) || '18:00',
          timezone: data.timezone || 'UTC',
          reminder_intervals: data.reminder_intervals || [7, 3, 1],
          advance_notifications_enabled: data.advance_notifications_enabled ?? true,
          due_date_notifications_enabled: data.due_date_notifications_enabled ?? true,
          overdue_notifications_enabled: data.overdue_notifications_enabled ?? true,
          escalation_enabled: data.escalation_enabled ?? false,
          escalation_days: data.escalation_days || 3
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
            timezone: preferences.timezone,
            reminder_intervals: preferences.reminder_intervals,
            advance_notifications_enabled: preferences.advance_notifications_enabled,
            due_date_notifications_enabled: preferences.due_date_notifications_enabled,
            overdue_notifications_enabled: preferences.overdue_notifications_enabled,
            escalation_enabled: preferences.escalation_enabled,
            escalation_days: preferences.escalation_days
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

  const handleReminderIntervalsChange = (value: string) => {
    const intervals = value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v) && v > 0);
    setPreferences(prev => ({ ...prev, reminder_intervals: intervals }));
  };

  const handleAdvanceNotificationsToggle = (checked: boolean) => {
    setPreferences(prev => ({ ...prev, advance_notifications_enabled: checked }));
  };

  const handleDueDateNotificationsToggle = (checked: boolean) => {
    setPreferences(prev => ({ ...prev, due_date_notifications_enabled: checked }));
  };

  const handleOverdueNotificationsToggle = (checked: boolean) => {
    setPreferences(prev => ({ ...prev, overdue_notifications_enabled: checked }));
  };

  const handleEscalationToggle = (checked: boolean) => {
    setPreferences(prev => ({ ...prev, escalation_enabled: checked }));
  };

  const handleEscalationDaysChange = (value: string) => {
    const days = parseInt(value);
    if (!isNaN(days) && days > 0) {
      setPreferences(prev => ({ ...prev, escalation_days: days }));
    }
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

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Reminder Settings
              </h4>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="advance-notifications">Advance Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded before tasks are due
                    </p>
                  </div>
                  <Switch
                    id="advance-notifications"
                    checked={preferences.advance_notifications_enabled}
                    onCheckedChange={handleAdvanceNotificationsToggle}
                  />
                </div>

                {preferences.advance_notifications_enabled && (
                  <div className="space-y-2 pl-4 border-l-2 border-muted">
                    <Label>Remind me (days before due date)</Label>
                    <Input
                      type="text"
                      value={preferences.reminder_intervals.join(', ')}
                      onChange={(e) => handleReminderIntervalsChange(e.target.value)}
                      placeholder="7, 3, 1"
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter comma-separated days (e.g., "7, 3, 1" for 7 days, 3 days, and 1 day before)
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="due-date-notifications" className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Due Date Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when tasks are due today
                    </p>
                  </div>
                  <Switch
                    id="due-date-notifications"
                    checked={preferences.due_date_notifications_enabled}
                    onCheckedChange={handleDueDateNotificationsToggle}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="overdue-notifications" className="flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Overdue Task Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about tasks that are past due
                    </p>
                  </div>
                  <Switch
                    id="overdue-notifications"
                    checked={preferences.overdue_notifications_enabled}
                    onCheckedChange={handleOverdueNotificationsToggle}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="escalation-notifications" className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Escalation Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Extra reminders for tasks that remain overdue
                      </p>
                    </div>
                    <Switch
                      id="escalation-notifications"
                      checked={preferences.escalation_enabled}
                      onCheckedChange={handleEscalationToggle}
                    />
                  </div>

                  {preferences.escalation_enabled && (
                    <div className="space-y-2 pl-4 border-l-2 border-muted">
                      <Label>Start escalation after</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          max="30"
                          value={preferences.escalation_days}
                          onChange={(e) => handleEscalationDaysChange(e.target.value)}
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">days overdue</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        How many days past due before sending escalation reminders
                      </p>
                    </div>
                  )}
                </div>
              </div>
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
            <li>• Notifications are checked every 30 minutes at your preferred time</li>
            <li>• <strong>Advance notifications:</strong> Get reminded X days before tasks are due</li>
            <li>• <strong>Due date notifications:</strong> Reminders for tasks due today</li>
            <li>• <strong>Overdue notifications:</strong> Alerts for tasks past their due date</li>
            <li>• <strong>Escalation notifications:</strong> Extra reminders for persistently overdue tasks</li>
            <li>• All notifications respect your timezone and preferred time</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
