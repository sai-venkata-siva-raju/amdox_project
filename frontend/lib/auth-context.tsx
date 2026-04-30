'use client';

import * as React from 'react';

export type UserRole = 'superadmin' | 'tenantadmin' | 'manager' | 'viewer';

export interface UserProfile {
  id: string;
  tenant_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: UserRole;
  tenant_name?: string;
  tenant_slug?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  session: any | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, tenantName: string, tenantSlug: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const mockUser: UserProfile = {
  id: 'mock-user-id',
  tenant_id: 'mock-tenant-id',
  full_name: 'Demo User',
  email: 'demo@example.com',
  avatar_url: null,
  role: 'tenantadmin',
  tenant_name: 'Demo Organization',
  tenant_slug: 'demo-org'
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserProfile | null>(mockUser);
  const [session, setSession] = React.useState<any | null>({ user: mockUser });
  const [profile, setProfile] = React.useState<UserProfile | null>(mockUser);
  const [loading, setLoading] = React.useState(false);

  const signIn = async (email: string, password: string) => {
    // Mock sign in - always succeeds
    setUser(mockUser);
    setSession({ user: mockUser });
    setProfile(mockUser);
    return { error: null };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    tenantName: string,
    tenantSlug: string
  ) => {
    // Mock sign up - always succeeds
    const newUser = { ...mockUser, full_name: fullName, tenant_name: tenantName, tenant_slug: tenantSlug };
    setUser(newUser);
    setSession({ user: newUser });
    setProfile(newUser);
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, profile, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
