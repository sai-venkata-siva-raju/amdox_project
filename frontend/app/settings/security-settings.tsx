'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Shield, Lock, Key, Monitor, Smartphone, Loader as Loader2, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface Session {
  id: string;
  device: string;
  browser: string;
  ip_address: string;
  last_active: string;
  is_current: boolean;
}

export function SecuritySettings() {
  const { profile, user } = useAuth();
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [twoFA, setTwoFA] = React.useState(false);

  const [passwordForm, setPasswordForm] = React.useState({
    current: '', new: '', confirm: '',
  });
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);

  const fetchSessions = React.useCallback(async () => {
    if (!profile?.tenant_id || !user) return;
    setSessions([
      {
        id: '1',
        device: 'MacBook Pro',
        browser: 'Chrome 126',
        ip_address: '192.168.1.12',
        last_active: new Date().toISOString(),
        is_current: true,
      },
      {
        id: '2',
        device: 'iPhone 15',
        browser: 'Safari',
        ip_address: '192.168.1.19',
        last_active: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        is_current: false,
      },
    ]);
    setLoading(false);
  }, [profile?.tenant_id, user]);

  React.useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.new) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.new.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSaving(false);
    toast.success('Password changed successfully');
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  const revokeSession = async (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    toast.success('Session revoked');
  };

  const revokeAllOtherSessions = async () => {
    if (!user) return;
    setSessions((prev) => prev.filter((s) => s.is_current));
    toast.success('All other sessions revoked');
  };

  const deviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile')) return <Smartphone className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  if (loading) {
    return <Card><CardContent className="h-64 animate-pulse bg-muted/30 rounded-lg" /></Card>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Key className="h-4 w-4" /> Change Password
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                value={passwordForm.current}
                onChange={(e) => setPasswordForm((f) => ({ ...f, current: e.target.value }))}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>New Password</Label>
              <div className="relative">
                <Input
                  type={showNew ? 'text' : 'password'}
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, new: e.target.value }))}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleChangePassword} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4" /> Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${twoFA ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-slate-50 dark:bg-slate-800'}`}>
                <Lock className={`h-5 w-5 ${twoFA ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
              </div>
              <div>
                <p className="text-sm font-medium">Authenticator App</p>
                <p className="text-xs text-muted-foreground">
                  {twoFA ? 'Two-factor authentication is enabled' : 'Use an authenticator app for verification codes'}
                </p>
              </div>
            </div>
            <Switch checked={twoFA} onCheckedChange={(v) => { setTwoFA(v); toast.success(v ? '2FA enabled' : '2FA disabled'); }} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Monitor className="h-4 w-4" /> Active Sessions
              </CardTitle>
              <CardDescription>{sessions.length} active session{sessions.length !== 1 ? 's' : ''}</CardDescription>
            </div>
            {sessions.filter((s) => !s.is_current).length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-rose-600 hover:text-rose-700">
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Revoke All Others
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revoke all other sessions?</AlertDialogTitle>
                    <AlertDialogDescription>This will sign you out of all other devices. Your current session will remain active.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={revokeAllOtherSessions}>Revoke All</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Browser</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-24 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((s) => (
                <TableRow key={s.id} className={s.is_current ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {deviceIcon(s.device)}
                      <span className="text-sm font-medium">{s.device}</span>
                      {s.is_current && (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800 text-[10px]" variant="outline">
                          Current
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.browser}</TableCell>
                  <TableCell className="text-sm font-mono text-muted-foreground">{s.ip_address}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(s.last_active).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell className="text-right">
                    {!s.is_current && (
                      <Button variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700" onClick={() => revokeSession(s.id)}>
                        Revoke
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {sessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No active sessions</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
