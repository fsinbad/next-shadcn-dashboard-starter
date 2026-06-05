import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/session';
import { findMembershipsByUserId } from '@/lib/db-queries';

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await request.json();
  if (!orgId) {
    return NextResponse.json({ error: 'Missing orgId' }, { status: 400 });
  }

  // Verify user is a member of this org
  const memberships = await findMembershipsByUserId(session.user.id);
  const isMember = memberships.some((m) => m.org_id === orgId);

  if (!isMember) {
    return NextResponse.json({ error: 'Not a member' }, { status: 403 });
  }

  const cookieStore = await cookies();
  cookieStore.set('active_org', orgId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/'
  });

  return NextResponse.json({ success: true });
}
