'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LayoutDashboard, DollarSign, Users, Truck, FolderKanban, ChartBar as BarChart3, Settings, Bell, Shield, ChevronLeft, ChevronRight } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Finance', href: '/finance', icon: DollarSign },
  { label: 'HR & Payroll', href: '/hr-payroll', icon: Users },
  { label: 'Supply Chain', href: '/supply-chain', icon: Truck },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Audit Log', href: '/login/audit-log', icon: Shield },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full flex-col bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:z-auto lg:translate-x-0',
          collapsed ? 'w-[68px]' : 'w-[260px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo area */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <Link href="/" className="flex items-center gap-3" onClick={onMobileClose}>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/20 font-bold text-sm">
              A
            </div>
            {!collapsed && (
              <span className="text-lg font-bold tracking-wider">AMDOX</span>
            )}
          </Link>
          <button
            onClick={onToggle}
            className="hidden rounded-md p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white lg:flex"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-[hsl(var(--sidebar-accent))] text-white shadow-sm'
                    : 'text-[hsl(var(--sidebar-muted))] hover:bg-white/10 hover:text-white'
                )}
              >
                <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-white')} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-white/10 p-3">
          {!collapsed && (
            <div className="rounded-lg bg-white/5 px-3 py-2.5">
              <p className="text-xs font-medium text-white/70">Amdox ERP Suite</p>
              <p className="text-[11px] text-white/40">v2.4.1</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
