'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DollarSign, Users, Truck, FolderKanban, ChartBar as BarChart3 } from 'lucide-react';

interface Activity {
  id: string;
  action: string;
  module: string;
  created_at: string;
}

const moduleConfig: Record<string, { icon: React.ElementType; color: string }> = {
  Finance: { icon: DollarSign, color: 'bg-emerald-500' },
  'HR & Payroll': { icon: Users, color: 'bg-blue-500' },
  'Supply Chain': { icon: Truck, color: 'bg-amber-500' },
  Projects: { icon: FolderKanban, color: 'bg-violet-500' },
  Reports: { icon: BarChart3, color: 'bg-cyan-500' },
};

const defaultConfig = { icon: BarChart3, color: 'bg-gray-500' };

function formatTimeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {activities.map((activity, idx) => {
          const config = moduleConfig[activity.module] || defaultConfig;
          const Icon = config.icon;
          return (
            <div
              key={activity.id}
              className={cn(
                'flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-muted/50',
                idx < activities.length - 1 && 'border-b border-border/50'
              )}
            >
              <div
                className={cn(
                  'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                  config.color
                )}
              >
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm leading-snug">{activity.action}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {activity.module}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.created_at)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
