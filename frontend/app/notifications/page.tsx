'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

const NotificationsList = dynamic(() => import('./notifications-list').then((m) => ({ default: m.NotificationsList })), { ssr: false });

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground">Stay updated with alerts across all modules</p>
      </div>
      <NotificationsList />
    </div>
  );
}
