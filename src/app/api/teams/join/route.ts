import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { findOrgById, findMembership, createMembership } from '@/lib/db-queries';

export async function POST(request: NextRequest) {
  const ctx = await auth();
  if (!ctx.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await request.json();
  if (!orgId) {
    return NextResponse.json({ error: 'Missing orgId' }, { status: 400 });
  }

  // Verify org exists
  const org = await findOrgById(orgId);
  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  // Check if already a member
  const existing = await findMembership(ctx.userId, orgId);
  if (existing) {
    return NextResponse.json({ error: 'Already a member' }, { status: 409 });
  }

  // Create membership
  await createMembership({
    user_id: ctx.userId,
    org_id: orgId,
    role: 'member'
  });

  return NextResponse.json({ success: true, org });
}
