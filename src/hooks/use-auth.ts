'use client';

import { useAuthContext } from '@/components/auth/auth-provider';

export function useAuth() {
  const ctx = useAuthContext();
  return {
    isLoaded: ctx.isLoaded,
    isSignedIn: ctx.isSignedIn,
    userId: ctx.user?.id ?? null,
    orgId: ctx.org?.id ?? null,
    orgRole: ctx.org?.role ?? null,
    orgSlug: ctx.org?.slug ?? null
  };
}

export function useUser() {
  const ctx = useAuthContext();
  return {
    isLoaded: ctx.isLoaded,
    isSignedIn: ctx.isSignedIn,
    user: ctx.user
  };
}

export function useOrganization() {
  const ctx = useAuthContext();
  return {
    isLoaded: ctx.isLoaded,
    organization: ctx.org
      ? {
          id: ctx.org.id,
          name: ctx.org.name,
          slug: ctx.org.slug,
          role: ctx.org.role
        }
      : null,
    membership: ctx.org
      ? {
          role: ctx.org.role,
          id: ctx.org.membershipId
        }
      : null
  };
}

export function useOrganizationList() {
  const ctx = useAuthContext();
  return {
    isLoaded: ctx.isLoaded,
    userMemberships: {
      data: ctx.orgs.map((o) => ({
        id: o.id,
        organization: {
          id: o.id,
          name: o.name,
          slug: o.slug
        },
        role: o.role
      })),
      isLoading: !ctx.isLoaded
    },
    setActive: async ({ organization }: { organization: string | { id: string } }) => {
      const orgId = typeof organization === 'string' ? organization : organization.id;
      await ctx.setActiveOrg(orgId);
    }
  };
}
