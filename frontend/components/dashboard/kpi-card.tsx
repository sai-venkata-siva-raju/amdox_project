'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
  iconColor: string;
}

export function KpiCard({ title, value, change, trend, icon: Icon, iconColor }: KpiCardProps) {
  return (
    <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <div className="flex items-center gap-1.5">
              {trend === 'up' ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span
                className={cn(
                  'text-xs font-semibold',
                  trend === 'up' ? 'text-emerald-600' : 'text-red-500'
                )}
              >
                {change}
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </div>
          <div
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-lg',
              iconColor
            )}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
