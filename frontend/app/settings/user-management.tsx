'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { UserPlus, Loader as Loader2, Shield, Building2, User, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileRow {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
}

const roleConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  superadmin: { icon: Shield, color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800', label: 'Super Admin' },
  tenantadmin: { icon: Building2, color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800', label: 'Tenant Admin' },
  manager: { icon: User, color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800', label: 'Manager' },
  viewer: { icon: User, color: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700', label: 'Viewer' },
};

export function UserManagement() {
  const { profile } = useAuth();
  const [users, setUsers] = React.useState<ProfileRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [form, setForm] = React.useState({ email: '', full_name: '', role: 'viewer' });

  const fetchUsers = React.useCallback(async () => {
    if (!profile?.tenant_id) return;
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, role, created_at')
      .eq('tenant_id', profile.tenant_id);
    if (data) setUsers(data);
    setLoading(false);
  }, [profile?.tenant_id]);

  React.useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleInvite = async () => {
    if (!profile?.tenant_id || !form.email) return;
    setSaving(true);
    await supabase.from('tenant_invitations').insert({
      tenant_id: profile.tenant_id,
      email: form.email,
      role: form.role,
    });
    setSaving(false);
    setDialogOpen(false);
    setForm({ email: '', full_name: '', role: 'viewer' });
    toast.success(`Invitation sent to ${form.email}`);
  };

  const updateRole = async (userId: string, role: string) => {
    await supabase.from('profiles').update({ role }).eq('id', userId);
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
    toast.success('Role updated successfully');
  };

  if (loading) {
    return <Card><CardContent className="h-64 animate-pulse bg-muted/30 rounded-lg" /></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        {Object.entries(roleConfig).map(([key, cfg]) => {
          const count = users.filter((u) => u.role === key).length;
          const Icon = cfg.icon;
          return (
            <Card key={key} className="border-l-4 border-l-slate-300">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${cfg.color.split(' ')[0]}`}>
                  <Icon className={`h-4 w-4 ${cfg.color.split(' ')[1]}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{cfg.label}s</p>
                  <p className="text-lg font-bold">{count}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Team Members</CardTitle>
              <CardDescription>{users.length} users in your organization</CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Invite User
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const rc = roleConfig[u.role] || roleConfig.viewer;
                const Icon = rc.icon;
                const initials = u.full_name ? u.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?';
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium">{u.full_name || 'Unknown'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={rc.color} variant="outline">
                        <Icon className="mr-1 h-3 w-3" /> {rc.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select value={u.role} onValueChange={(v) => updateRole(u.id, v)}>
                        <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tenantadmin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No users found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>Send an invitation to join your organization.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="colleague@company.com" className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tenantadmin">Tenant Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={saving || !form.email}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
