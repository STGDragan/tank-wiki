import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, MessageSquare, Clock, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface NotificationPreferencesProps {
  userId: string;
}

interface Preferences {
  email_enabled: boolean;
  sms_enabled: boolean;
  sms_number: string;
  reminder_intervals: number[];
  escalation_enabled: boolean;
  escalation_days: number;
  notification_time: string;
  timezone: string;
  task_type_preferences: any;
}

export function NotificationPreferences({ userId }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<Preferences>({
    email_enabled: true,
    sms_enabled: false,
    sms_number: "",
    reminder_intervals: [7, 3, 1],
    escalation_enabled: false,
    escalation_days: 3,
    notification_time: "09:00",
    timezone: "UTC",
    task_type_preferences: {}
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    try {
      const { data } = await supabase
        .from('maintenance_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data) {
        setPreferences({
          email_enabled: data.email_enabled,
          sms_enabled: data.sms_enabled,
          sms_number: data.sms_number || "",
          reminder_intervals: data.reminder_intervals || [7, 3, 1],
          escalation_enabled: data.escalation_enabled,
          escalation_days: data.escalation_days,
          notification_time: data.notification_time.slice(0, 5), // Convert to HH:MM format
          timezone: data.timezone,
          task_type_preferences: data.task_type_preferences || {}
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('maintenance_notification_preferences')
        .upsert({
          user_id: userId,
          email_enabled: preferences.email_enabled,
          sms_enabled: preferences.sms_enabled,
          sms_number: preferences.sms_number,
          reminder_intervals: preferences.reminder_intervals,
          escalation_enabled: preferences.escalation_enabled,
          escalation_days: preferences.escalation_days,
          notification_time: preferences.notification_time + ":00", // Convert to HH:MM:SS format
          timezone: preferences.timezone,
          task_type_preferences: preferences.task_type_preferences
        });

      if (error) throw error;

      toast({
        title: "Preferences Saved",
        description: "Your notification preferences have been updated",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateReminderInterval = (index: number, value: string) => {
    const newIntervals = [...preferences.reminder_intervals];
    newIntervals[index] = parseInt(value);
    setPreferences({...preferences, reminder_intervals: newIntervals});
  };

  const addReminderInterval = () => {
    setPreferences({
      ...preferences, 
      reminder_intervals: [...preferences.reminder_intervals, 1].sort((a, b) => b - a)
    });
  };

  const removeReminderInterval = (index: number) => {
    const newIntervals = preferences.reminder_intervals.filter((_, i) => i !== index);
    setPreferences({...preferences, reminder_intervals: newIntervals});
  };

  if (loading) {
    return <div className="p-4">Loading notification preferences...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-500" />
          Notification Preferences
        </h3>
        <p className="text-sm text-muted-foreground">
          Customize how and when you receive maintenance reminders
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4" />
              Notification Channels
            </CardTitle>
            <CardDescription>
              Choose how you want to receive maintenance reminders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive reminders via email
                </p>
              </div>
              <Switch
                checked={preferences.email_enabled}
                onCheckedChange={(checked) => setPreferences({...preferences, email_enabled: checked})}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive urgent reminders via text message
                </p>
              </div>
              <Switch
                checked={preferences.sms_enabled}
                onCheckedChange={(checked) => setPreferences({...preferences, sms_enabled: checked})}
              />
            </div>

            {preferences.sms_enabled && (
              <div>
                <Label htmlFor="sms_number">Phone Number</Label>
                <Input
                  id="sms_number"
                  type="tel"
                  value={preferences.sms_number}
                  onChange={(e) => setPreferences({...preferences, sms_number: e.target.value})}
                  placeholder="+1 (555) 123-4567"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Include country code for international numbers
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reminder Timing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Reminder Timing
            </CardTitle>
            <CardDescription>
              Configure when and how often you receive reminders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Reminder Intervals (days before due date)</Label>
              <div className="space-y-2 mt-2">
                {preferences.reminder_intervals.map((interval, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select 
                      value={interval.toString()} 
                      onValueChange={(value) => updateReminderInterval(index, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 5, 7, 14, 30].map(days => (
                          <SelectItem key={days} value={days.toString()}>
                            {days} day{days !== 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">before due date</span>
                    {preferences.reminder_intervals.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeReminderInterval(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addReminderInterval}
                  disabled={preferences.reminder_intervals.length >= 5}
                >
                  Add Reminder
                </Button>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="notification_time">Preferred Time</Label>
                <Input
                  id="notification_time"
                  type="time"
                  value={preferences.notification_time}
                  onChange={(e) => setPreferences({...preferences, notification_time: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select 
                  value={preferences.timezone} 
                  onValueChange={(value) => setPreferences({...preferences, timezone: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Paris">Paris</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    <SelectItem value="Australia/Sydney">Sydney</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Escalation Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" />
              Escalation Settings
            </CardTitle>
            <CardDescription>
              Enhanced notifications for overdue maintenance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Escalation</Label>
                <p className="text-sm text-muted-foreground">
                  Send more frequent reminders for overdue tasks
                </p>
              </div>
              <Switch
                checked={preferences.escalation_enabled}
                onCheckedChange={(checked) => setPreferences({...preferences, escalation_enabled: checked})}
              />
            </div>

            {preferences.escalation_enabled && (
              <div>
                <Label htmlFor="escalation_days">Escalation Threshold</Label>
                <Select 
                  value={preferences.escalation_days.toString()} 
                  onValueChange={(value) => setPreferences({...preferences, escalation_days: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day overdue</SelectItem>
                    <SelectItem value="2">2 days overdue</SelectItem>
                    <SelectItem value="3">3 days overdue</SelectItem>
                    <SelectItem value="5">5 days overdue</SelectItem>
                    <SelectItem value="7">1 week overdue</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Start sending daily reminders after this period
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={savePreferences} disabled={saving}>
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </div>
    </div>
  );
}