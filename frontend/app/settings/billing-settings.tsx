'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Check, Zap, ArrowUpRight, Users, Database, HardDrive, ChartBar as BarChart3 } from 'lucide-react';

const planFeatures: Record<string, string[]> = {
  Starter: ['Up to 10 users', '5 GB storage', 'Basic reporting', 'Email support'],
  Professional: ['Up to 50 users', '50 GB storage', 'Advanced analytics', 'Priority support', 'API access'],
  Enterprise: ['Unlimited users', '500 GB storage', 'Custom integrations', '24/7 support', 'SLA guarantee', 'Dedicated account manager'],
};

export function BillingSettings() {
  const currentPlan = 'Professional';
  const usageData = [
    { label: 'Users', used: 12, limit: 50, icon: Users, unit: '' },
    { label: 'Storage', used: 8.2, limit: 50, icon: HardDrive, unit: ' GB' },
    { label: 'API Calls', used: 24500, limit: 100000, icon: Database, unit: '' },
    { label: 'Reports', used: 34, limit: 100, icon: BarChart3, unit: '' },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{currentPlan} Plan</h3>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800" variant="outline">
                    Active
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">$99/month, billed monthly</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Manage Subscription</Button>
              <Button size="sm">
                <ArrowUpRight className="mr-1.5 h-3.5 w-3.5" /> Upgrade Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Usage This Month</CardTitle>
          <CardDescription>Current billing period: April 1 - April 30, 2026</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {usageData.map((item) => {
            const pct = Math.min((item.used / item.limit) * 100, 100);
            const Icon = item.icon;
            const isHigh = pct > 80;
            return (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className={`font-mono ${isHigh ? 'text-amber-600 font-semibold' : 'text-muted-foreground'}`}>
                    {item.label === 'API Calls' ? item.used.toLocaleString() : item.used}{item.unit} / {item.label === 'API Calls' ? item.limit.toLocaleString() : item.limit}{item.unit}
                  </span>
                </div>
                <Progress
                  value={pct}
                  className={`h-2 ${isHigh ? '[&>div]:bg-amber-500' : '[&>div]:bg-blue-500'}`}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {['Starter', 'Professional', 'Enterprise'].map((plan) => {
          const isCurrent = plan === currentPlan;
          const price = plan === 'Starter' ? 29 : plan === 'Professional' ? 99 : 249;
          return (
            <Card key={plan} className={`relative ${isCurrent ? 'border-2 border-blue-500 shadow-md' : ''}`}>
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white shadow-sm">Current Plan</Badge>
                </div>
              )}
              <CardContent className="p-5 space-y-4 pt-7">
                <div>
                  <h3 className="font-bold text-lg">{plan}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold">${price}</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                </div>
                <Separator />
                <ul className="space-y-2">
                  {planFeatures[plan].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={isCurrent ? 'outline' : 'default'}
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Current Plan' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
