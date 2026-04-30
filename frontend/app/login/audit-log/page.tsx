'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

const AuditLogList = dynamic(() => import('./audit-log-list').then((m) => ({ default: m.AuditLogList })), { ssr: false });

export default function AuditLogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-sm text-muted-foreground">Track all system actions across modules</p>
      </div>
      <AuditLogList />
    </div>
  );
}
