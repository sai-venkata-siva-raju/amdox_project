'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth-context';
import { mockApi } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Bell, Mail, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface PrefRow {
  id: string;
  event_type: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
}

const eventLabels: Record<string, { label: string; description: string }> = {
  invoice_approved: { label: 'Invoice Approved', description: 'When an invoice is approved by management' },
  invoice_overdue: { label: 'Invoice Overdue', description: 'When an invoice passes its due date unpaid' },
  leave_request: { label: 'Leave Request', description: 'When a leave request is submitted or updated' },
  payroll_processed: { label: 'Payroll Processed', description: 'When monthly payroll run is completed' },
  low_stock_alert: { label: 'Low Stock Alert', description: 'When inventory falls below reorder point' },
  project_deadline: { label: 'Project Deadline', description: 'When a project deadline is approaching' },
  system_maintenance: { label: 'System Maintenance', description: 'Scheduled maintenance and updates' },
  new_user_added: { label: 'New User Added', description: 'When a new member joins the organization' },
};

const defaultPrefs = Object.keys(eventLabels).map((eventType) => ({
  event_type: eventType,
  email_enabled: eventType !== 'new_user_added',
  sms_enabled: eventType === 'invoice_overdue' || eventType === 'low_stock_alert',
  in_app_enabled: true,
}));

export function NotificationPreferences() {
  const { profile, user } = useAuth();
  const [prefs, setPrefs] = React.useState<PrefRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchPrefs = React.useCallback(async () => {
    if (!profile?.tenant_id || !user) return;
    // Use mock data instead of supabase
    const { data } = await mockApi.getNotificationPreferences();

    if (data && data.length > 0) {
      setPrefs(data);
    } else {
      setPrefs(defaultPrefs.map((p) => ({ id: '', ...p })) as PrefRow[]);
    }
    setLoading(false);
  }, [profile?.tenant_id, user]);

  React.useEffect(() => { fetchPrefs(); }, [fetchPrefs]);

  const togglePref = async (eventType: string, channel: 'email_enabled' | 'sms_enabled' | 'in_app_enabled') => {
    if (!profile?.tenant_id || !user) return;

    const existing = prefs.find((p) => p.event_type === eventType);
    const newVal = !(existing?.[channel] ?? defaultPrefs.find((d) => d.event_type === eventType)?.[channel] ?? true);

    setPrefs((prev) => {
      const idx = prev.findIndex((p) => p.event_type === eventType);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], [channel]: newVal };
        return updated;
      }
      return [...prev, { id: '', event_type: eventType, email_enabled: channel === 'email_enabled' ? newVal : true, sms_enabled: channel === 'sms_enabled' ? newVal : false, in_app_enabled: channel === 'in_app_enabled' ? newVal : true }];
    });

    // Mock update/insert operations
    if (existing?.id) {
      await mockApi.update('notification_preferences', existing.id, { [channel]: newVal });
    } else {
      const existingPref = defaultPrefs.find((d) => d.event_type === eventType);
      await mockApi.insert('notification_preferences', {
        tenant_id: profile.tenant_id,
        user_id: user.id,
        event_type: eventType,
        email_enabled: channel === 'email_enabled' ? newVal : (existingPref?.email_enabled ?? true),
        sms_enabled: channel === 'sms_enabled' ? newVal : (existingPref?.sms_enabled ?? false),
        in_app_enabled: channel === 'in_app_enabled' ? newVal : (existingPref?.in_app_enabled ?? true),
      });
    }
    toast.success('Notification preference updated');
  };

  if (loading) {
    return <Card><CardContent className="h-64 animate-pulse bg-muted/30 rounded-lg" /></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Bell className="h-4 w-4" /> Notification Channels
        </CardTitle>
        <CardDescription>Choose how you want to be notified for each event type</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead className="text-center w-24">
                <div className="flex flex-col items-center gap-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[10px]">Email</span>
                </div>
              </TableHead>
              <TableHead className="text-center w-24">
                <div className="flex flex-col items-center gap-1">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[10px]">SMS</span>
                </div>
              </TableHead>
              <TableHead className="text-center w-24">
                <div className="flex flex-col items-center gap-1">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[10px]">In-App</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(eventLabels).map(([eventType, cfg]) => {
              const pref = prefs.find((p) => p.event_type === eventType);
              const defPref = defaultPrefs.find((d) => d.event_type === eventType);
              return (
                <TableRow key={eventType}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{cfg.label}</p>
                      <p className="text-xs text-muted-foreground">{cfg.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={pref?.email_enabled ?? defPref?.email_enabled ?? true}
                      onCheckedChange={() => togglePref(eventType, 'email_enabled')}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={pref?.sms_enabled ?? defPref?.sms_enabled ?? false}
                      onCheckedChange={() => togglePref(eventType, 'sms_enabled')}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={pref?.in_app_enabled ?? defPref?.in_app_enabled ?? true}
                      onCheckedChange={() => togglePref(eventType, 'in_app_enabled')}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
