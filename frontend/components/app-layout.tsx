'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { TopNavbar } from '@/components/top-navbar';
import { ProtectedRoute } from '@/components/protected-route';
import { cn } from '@/lib/utils';

const authRoutes = ['/login', '/register'];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = authRoutes.some((route) => pathname?.startsWith(route));

  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <TopNavbar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
