import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
  const ctx = await auth();

  if (!ctx.userId) {
    return NextResponse.json({ user: null, org: null, orgs: [] }, { status: 401 });
  }

  const { findMembershipsByUserId } = await import('@/lib/db-queries');
  const memberships = await findMembershipsByUserId(ctx.userId);

  return NextResponse.json({
    user: ctx.user,
    org: ctx.org,
    orgs: memberships.map((m) => ({
      id: m.org_id,
      name: m.org_name,
      slug: m.org_slug,
      role: m.role,
      membershipId: m.id
    }))
  });
}
