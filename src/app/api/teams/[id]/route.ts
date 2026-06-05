import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { findMembership } from '@/lib/db-queries';
import { prisma } from '@/lib/db';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await auth();
  if (!ctx.userId || !ctx.orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin permission
  const myMembership = await findMembership(ctx.userId, ctx.orgId);
  if (!myMembership || myMembership.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const { id } = await params;

  // Cannot remove yourself if you're the only admin
  const adminCount = await prisma.membership.count({
    where: { org_id: ctx.orgId, role: 'admin' }
  });

  const targetMembership = await findMembership(id, ctx.orgId);
  if (!targetMembership) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  if (targetMembership.role === 'admin' && adminCount <= 1) {
    return NextResponse.json({ error: 'Cannot remove the last admin' }, { status: 400 });
  }

  await prisma.membership.deleteMany({
    where: { user_id: id, org_id: ctx.orgId }
  });

  return NextResponse.json({ success: true });
}
