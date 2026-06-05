'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface AuthOrg {
  id: string;
  name: string;
  slug: string;
  role: string;
  membershipId: string;
}

interface AuthUser {
  id: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
}

interface AuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: AuthUser | null;
  org: AuthOrg | null;
  orgs: AuthOrg[];
}

interface AuthContextValue extends AuthState {
  setActiveOrg: (orgId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoaded: false,
    isSignedIn: false,
    user: null,
    org: null,
    orgs: []
  });

  const fetchAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setState({
          isLoaded: true,
          isSignedIn: true,
          user: data.user,
          org: data.org,
          orgs: data.orgs
        });
      } else {
        setState({
          isLoaded: true,
          isSignedIn: false,
          user: null,
          org: null,
          orgs: []
        });
      }
    } catch {
      setState({
        isLoaded: true,
        isSignedIn: false,
        user: null,
        org: null,
        orgs: []
      });
    }
  }, []);

  useEffect(() => {
    fetchAuth();
  }, [fetchAuth]);

  const setActiveOrg = useCallback(
    async (orgId: string) => {
      await fetch('/api/auth/set-org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId })
      });
      await fetchAuth();
    },
    [fetchAuth]
  );

  const signOut = useCallback(async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    setState({
      isLoaded: true,
      isSignedIn: false,
      user: null,
      org: null,
      orgs: []
    });
    window.location.href = '/';
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        setActiveOrg,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return ctx;
}
