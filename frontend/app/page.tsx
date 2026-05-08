'use client';

import * as React from 'react';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, ShoppingCart, Clock } from 'lucide-react';
import apiClient from '@/lib/api';
import { mockApi } from '@/lib/mock-data';

interface KpiMetric {
  id: string;
  metric_key: string;
  metric_value: number;
  label: string;
}

interface Activity {
  id: string;
  action: string;
  module: string;
  created_at: string;
}

const kpiConfig: Record<string, {
  icon: React.ElementType;
  iconColor: string;
  change: string;
  trend: 'up' | 'down';
  format: (v: number) => string;
}> = {
  total_revenue: {
    icon: DollarSign,
    iconColor: 'bg-emerald-500',
    change: '+12.5%',
    trend: 'up',
    format: (v) => `$${(v / 1000000).toFixed(2)}M`,
  },
  active_employees: {
    icon: Users,
    iconColor: 'bg-blue-500',
    change: '+3.2%',
    trend: 'up',
    format: (v) => v.toLocaleString(),
  },
  open_purchase_orders: {
    icon: ShoppingCart,
    iconColor: 'bg-amber-500',
    change: '-5.1%',
    trend: 'down',
    format: (v) => v.toString(),
  },
  pending_approvals: {
    icon: Clock,
    iconColor: 'bg-rose-500',
    change: '-8.3%',
    trend: 'down',
    format: (v) => v.toString(),
  },
};

export default function DashboardPage() {
  const [kpis, setKpis] = React.useState<KpiMetric[]>([]);
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await apiClient.getDashboardSummary();

        if (response.data) {
          setKpis(response.data.kpis);
          setActivities(response.data.activities);
          return;
        }

        const fallback = await Promise.all([
          mockApi.getKpiData(),
          mockApi.getActivities(),
        ]);

        if (fallback[0].data) setKpis(fallback[0].data);
        if (fallback[1].data) setActivities(fallback[1].data);
      } catch {
        const [kpiRes, actRes] = await Promise.all([
          mockApi.getKpiData(),
          mockApi.getActivities(),
        ]);

        if (kpiRes.data) setKpis(kpiRes.data);
        if (actRes.data) setActivities(actRes.data);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, John. Here&apos;s what&apos;s happening across your organization.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="h-8 w-32 rounded bg-muted" />
                    <div className="h-3 w-20 rounded bg-muted" />
                  </div>
                </CardContent>
              </Card>
            ))
          : kpis.map((kpi) => {
              const config = kpiConfig[kpi.metric_key];
              if (!config) return null;
              return (
                <KpiCard
                  key={kpi.id}
                  title={kpi.label}
                  value={config.format(kpi.metric_value)}
                  change={config.change}
                  trend={config.trend}
                  icon={config.icon}
                  iconColor={config.iconColor}
                />
              );
            })}
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity feed - takes 2 columns */}
        <div className="lg:col-span-2">
          {loading ? (
            <Card>
              <CardHeader>
                <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-8 w-8 animate-pulse rounded bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <ActivityFeed activities={activities} />
          )}
        </div>

        {/* Quick actions panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Create Invoice', desc: 'Generate a new invoice' },
                { label: 'Add Employee', desc: 'Onboard new team member' },
                { label: 'New Purchase Order', desc: 'Create a PO request' },
                { label: 'Run Payroll', desc: 'Process monthly payroll' },
              ].map((action) => (
                <button
                  key={action.label}
                  className="flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: 'Q1 Tax Filing', date: 'Apr 30', urgent: true },
                { title: 'Vendor Payment - TechSupply', date: 'May 5', urgent: false },
                { title: 'Payroll Approval', date: 'May 1', urgent: true },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.urgent && (
                      <div className="h-2 w-2 rounded-full bg-rose-500" />
                    )}
                    <span className="text-sm">{item.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
