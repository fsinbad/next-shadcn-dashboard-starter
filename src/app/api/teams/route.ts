import { NextRequest, NextResponse } from 'next/server';
import { findOrgMembers } from '@/lib/db-queries';
import { auth } from '@/lib/auth';

export async function GET() {
  const ctx = await auth();
  if (!ctx.userId || !ctx.orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const members = await findOrgMembers(ctx.orgId);
  return NextResponse.json({ members });
}
