'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth-context';
import { mockApi } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Download, Filter, Shield, Loader as Loader2, User, Clock,
} from 'lucide-react';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  module: string;
  entity_type: string;
  description: string;
  ip_address: string;
  created_at: string;
  profiles: { full_name: string } | null;
}

const actionColors: Record<string, string> = {
  Create: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
  Update: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800',
  Delete: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800',
  Login: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
};

const moduleColors: Record<string, string> = {
  Finance: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
  HR: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
  'Supply Chain': 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
  Projects: 'bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400',
  System: 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export function AuditLogList() {
  const { profile } = useAuth();
  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [moduleFilter, setModuleFilter] = React.useState('all');
  const [actionFilter, setActionFilter] = React.useState('all');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');

  const fetchLogs = React.useCallback(async () => {
    if (!profile?.tenant_id) return;
    // Use mock data instead of supabase
    const { data } = await mockApi.getAuditLogs();
    if (data) setLogs(data as any);
    setLoading(false);
  }, [profile?.tenant_id, moduleFilter, actionFilter, dateFrom, dateTo]);

  React.useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const exportCSV = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Module', 'Entity Type', 'Description', 'IP Address'];
    const rows = logs.map((l) => [
      new Date(l.created_at).toISOString(),
      l.profiles?.full_name || 'System',
      l.action,
      l.module,
      l.entity_type,
      `"${l.description.replace(/"/g, '""')}"`,
      l.ip_address,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Audit log exported to CSV');
  };

  const actionCounts = {
    create: logs.filter((l) => l.action === 'Create').length,
    update: logs.filter((l) => l.action === 'Update').length,
    delete: logs.filter((l) => l.action === 'Delete').length,
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="h-20 animate-pulse bg-muted/30 rounded-lg" /></Card>
          ))}
        </div>
        <Card><CardContent className="h-64 animate-pulse bg-muted/30 rounded-lg" /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-l-4 border-l-slate-400">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
              <Shield className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Events</p>
              <p className="text-2xl font-bold">{logs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">C</span>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Creates</p>
              <p className="text-2xl font-bold">{actionCounts.create}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/30">
              <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">U</span>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Updates</p>
              <p className="text-2xl font-bold">{actionCounts.update}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-rose-500">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/30">
              <span className="text-rose-600 dark:text-rose-400 font-bold text-sm">D</span>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Deletes</p>
              <p className="text-2xl font-bold">{actionCounts.delete}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filters
            </CardTitle>
            <Button variant="outline" size="sm" onClick={exportCSV} disabled={logs.length === 0}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger><SelectValue placeholder="Module" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Supply Chain">Supply Chain</SelectItem>
                <SelectItem value="Projects">Projects</SelectItem>
                <SelectItem value="System">System</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger><SelectValue placeholder="Action" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="Create">Create</SelectItem>
                <SelectItem value="Update">Update</SelectItem>
                <SelectItem value="Delete">Delete</SelectItem>
                <SelectItem value="Login">Login</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="From date" />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="To date" />
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                const ac = actionColors[log.action] || actionColors.Update;
                const mc = moduleColors[log.module] || moduleColors.System;
                return (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {new Date(log.created_at).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{log.profiles?.full_name || 'System'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={ac} variant="outline">{log.action}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={mc} variant="outline">{log.module}</Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate">{log.description}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{log.ip_address}</TableCell>
                  </TableRow>
                );
              })}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No audit log entries found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
