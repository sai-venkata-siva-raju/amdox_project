'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, Bell, Shield, CreditCard } from 'lucide-react';

const CompanyProfile = dynamic(() => import('./company-profile').then((m) => ({ default: m.CompanyProfile })), { ssr: false });
const UserManagement = dynamic(() => import('./user-management').then((m) => ({ default: m.UserManagement })), { ssr: false });
const NotificationPreferences = dynamic(() => import('./notification-preferences').then((m) => ({ default: m.NotificationPreferences })), { ssr: false });
const SecuritySettings = dynamic(() => import('./security-settings').then((m) => ({ default: m.SecuritySettings })), { ssr: false });
const BillingSettings = dynamic(() => import('./billing-settings').then((m) => ({ default: m.BillingSettings })), { ssr: false });

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your organization, users, and preferences</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList>
          <TabsTrigger value="company" className="gap-1.5"><Building2 className="h-3.5 w-3.5" /> Company</TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Users</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5"><Bell className="h-3.5 w-3.5" /> Notifications</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5"><Shield className="h-3.5 w-3.5" /> Security</TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="company"><CompanyProfile /></TabsContent>
        <TabsContent value="users"><UserManagement /></TabsContent>
        <TabsContent value="notifications"><NotificationPreferences /></TabsContent>
        <TabsContent value="security"><SecuritySettings /></TabsContent>
        <TabsContent value="billing"><BillingSettings /></TabsContent>
      </Tabs>
    </div>
  );
}
