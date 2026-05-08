'use client';

import * as React from 'react';
import { useEffect } from 'react';
import apiClient, { UserRole, UserProfile as ApiUserProfile } from './api';

export interface UserProfile extends ApiUserProfile {}
export type { UserRole };

interface AuthContextValue {
  user: UserProfile | null;
  session: any | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, tenantName: string, tenantSlug: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [session, setSession] = React.useState<any | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Check for existing token and validate user on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = apiClient.getToken();
        if (token) {
          const response = await apiClient.getCurrentUser();
          if (response.data) {
            const userData = response.data;
            setUser(userData);
            setSession({ user: userData });
            setProfile(userData);
          } else {
            // Token is invalid, clear it
            apiClient.clearToken();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        apiClient.clearToken();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiClient.login({ email, password });
      
      if (response.error) {
        return { error: response.error };
      }

      if (response.data) {
        const { token, user: userData } = response.data;
        apiClient.setToken(token);
        
        const userProfile: UserProfile = {
          id: userData.id,
          tenant_id: userData.tenant_id,
          full_name: userData.full_name,
          email: userData.email,
          avatar_url: userData.avatar_url || null,
          role: userData.role as UserRole,
          tenant_name: userData.tenant_name,
          tenant_slug: userData.tenant_slug,
        };

        setUser(userProfile);
        setSession({ user: userProfile });
        setProfile(userProfile);
        
        return { error: null };
      }

      return { error: 'Login failed' };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    tenantName: string,
    tenantSlug: string
  ) => {
    setLoading(true);
    try {
      const response = await apiClient.register({
        email,
        password,
        fullName,
        tenantName,
        tenantSlug,
      });

      if (response.error) {
        return { error: response.error };
      }

      if (response.data) {
        const { token, user: userData } = response.data;
        apiClient.setToken(token);

        const userProfile: UserProfile = {
          id: userData.id,
          tenant_id: userData.tenant_id,
          full_name: userData.full_name,
          email: userData.email,
          avatar_url: userData.avatar_url || null,
          role: userData.role as UserRole,
          tenant_name: userData.tenant_name,
          tenant_slug: userData.tenant_slug,
        };

        setUser(userProfile);
        setSession({ user: userProfile });
        setProfile(userProfile);

        return { error: null };
      }

      return { error: 'Registration failed' };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      apiClient.clearToken();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
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
