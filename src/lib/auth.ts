import { cookies } from 'next/headers';
import { cache } from 'react';
import { getCurrentSession } from './session';
import { findMembershipsByUserId, findOrgById } from './db-queries';

export interface AuthContext {
  userId: string | null;
  orgId: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
  } | null;
  org: {
    id: string;
    name: string;
    slug: string;
    role: string;
  } | null;
}

export const auth = cache(async (): Promise<AuthContext> => {
  const session = await getCurrentSession();

  if (!session) {
    return {
      userId: null,
      orgId: null,
      user: null,
      org: null
    };
  }

  const cookieStore = await cookies();
  const activeOrgId = cookieStore.get('active_org')?.value;

  let org: AuthContext['org'] = null;

  if (activeOrgId) {
    const orgRecord = await findOrgById(activeOrgId);
    const memberships = await findMembershipsByUserId(session.user.id);
    const membership = memberships.find((m) => m.org_id === activeOrgId);

    if (orgRecord && membership) {
      org = {
        id: orgRecord.id,
        name: orgRecord.name,
        slug: orgRecord.slug,
        role: membership.role
      };
    }
  }

  // If no active org or invalid, default to first membership
  if (!org) {
    const memberships = await findMembershipsByUserId(session.user.id);
    if (memberships.length > 0) {
      const first = memberships[0];
      org = {
        id: first.org_id,
        name: first.org_name,
        slug: first.org_slug,
        role: first.role
      };
      cookieStore.set('active_org', first.org_id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/'
      });
    }
  }

  return {
    userId: session.user.id,
    orgId: org?.id ?? null,
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      avatarUrl: session.user.avatar_url
    },
    org
  };
});

export async function requireAuth() {
  const ctx = await auth();
  if (!ctx.userId) {
    throw new Error('Unauthorized');
  }
  return ctx;
}
