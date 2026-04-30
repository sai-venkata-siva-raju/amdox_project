'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth-context';
import { mockApi } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { BellOff, Check, CheckCheck, DollarSign, Users, Truck, FolderKanban, Settings, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  module: string;
  read: boolean;
  created_at: string;
}

const moduleConfig: Record<string, { icon: React.ElementType; color: string }> = {
  Finance: { icon: DollarSign, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400' },
  HR: { icon: Users, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' },
  'Supply Chain': { icon: Truck, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400' },
  Projects: { icon: FolderKanban, color: 'bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400' },
  System: { icon: Settings, color: 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function NotificationsList() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('all');

  const fetchNotifications = React.useCallback(async () => {
    if (!profile?.tenant_id) return;
    // Use mock data instead of supabase
    const { data } = await mockApi.getNotifications();
    if (data) setNotifications(data);
    setLoading(false);
  }, [profile?.tenant_id]);

  React.useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const filtered = filter === 'all'
    ? notifications
    : notifications.filter((n) => n.module === filter);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    await mockApi.update('notifications', id, { read: true });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = async () => {
    if (!profile?.tenant_id) return;
    // Mock update operation
    console.log('Mock: Marking all notifications as read');
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = async (id: string) => {
    await mockApi.delete('notifications', id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success('Notification deleted');
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}><CardContent className="h-20 animate-pulse bg-muted/30 rounded-lg" /></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Filter by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Supply Chain">Supply Chain</SelectItem>
              <SelectItem value="Projects">Projects</SelectItem>
              <SelectItem value="System">System</SelectItem>
            </SelectContent>
          </Select>
          {unreadCount > 0 && (
            <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300" variant="secondary">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="mr-1.5 h-3.5 w-3.5" /> Mark all read
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <BellOff className="h-12 w-12 mb-4 opacity-30" />
          <p className="text-sm font-medium">No notifications</p>
          <p className="text-xs mt-1">You&apos;re all caught up</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const mc = moduleConfig[n.module] || moduleConfig.System;
            const Icon = mc.icon;
            return (
              <Card
                key={n.id}
                className={`transition-all hover:shadow-sm ${!n.read ? 'border-l-4 border-l-primary/60 bg-primary/[0.02]' : ''}`}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${mc.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm ${!n.read ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{n.module}</Badge>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">{timeAgo(n.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {!n.read && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markAsRead(n.id)}>
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-600" onClick={() => deleteNotification(n.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
