'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useAuth, type UserRole } from '@/lib/auth-context';
import { mockApi } from '@/lib/mock-data';
import { Bell, Menu, Moon, Sun, Search, LogOut, User, Building2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlobalSearch } from '@/components/global-search';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const roleLabels: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  tenantadmin: 'Tenant Admin',
  manager: 'Manager',
  viewer: 'Viewer',
};

const roleIcons: Record<UserRole, React.ElementType> = {
  superadmin: Shield,
  tenantadmin: Building2,
  manager: User,
  viewer: User,
};

interface TopNavbarProps {
  onMenuClick: () => void;
}

export function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const { theme, setTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!profile?.tenant_id) return;

    const fetchUnread = async () => {
      // Mock notification count
      const { data } = await mockApi.getNotifications();
      const unreadCount = data?.filter(n => !n.read).length || 0;
      setUnreadCount(unreadCount);
    };

    fetchUnread();

    // Mock real-time updates - simplified for demo
    const interval = setInterval(fetchUnread, 30000); // Poll every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, [profile?.tenant_id]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email
    ? user.email[0].toUpperCase()
    : 'U';

  const RoleIcon = profile?.role ? roleIcons[profile.role] : User;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <button
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex items-center gap-2 h-9 w-80 rounded-md border border-input bg-muted/50 px-3 text-sm text-muted-foreground hover:bg-muted/70 transition-colors"
        >
          <Search className="h-4 w-4" />
          <span>Search employees, invoices, projects...</span>
          <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">&#8984;</span>K
          </kbd>
        </button>
        <GlobalSearch externalOpen={searchOpen} onExternalOpenChange={setSearchOpen} />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          onClick={() => router.push('/notifications')}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 rounded-full p-0 text-[10px] flex items-center justify-center bg-rose-500 text-white border-0">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="ml-1 flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium leading-none">
                  {profile?.full_name || user?.email || 'User'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {profile?.role ? roleLabels[profile.role] : 'Loading...'}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1">
                <span>{profile?.full_name || user?.email}</span>
                {profile?.tenant_name && (
                  <span className="text-xs font-normal text-muted-foreground">
                    {profile.tenant_name}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <User className="mr-2 h-4 w-4" />
              Profile & Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <RoleIcon className="mr-2 h-4 w-4" />
              Role: {profile?.role ? roleLabels[profile.role] : 'N/A'}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Building2 className="mr-2 h-4 w-4" />
              Switch Tenant
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
