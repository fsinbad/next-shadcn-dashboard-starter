import { type NextRequest, NextResponse } from 'next/server';
import { createOrg, createMembership, findOrgBySlug } from '@/lib/db-queries';
import { getCurrentSession } from '@/lib/session';
import { slugify } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await request.json();
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Missing name' }, { status: 400 });
  }

  const slug = slugify(name);

  // Ensure unique slug
  let uniqueSlug = slug;
  let suffix = 1;
  while (await findOrgBySlug(uniqueSlug)) {
    uniqueSlug = `${slug}-${suffix}`;
    suffix++;
  }

  try {
    const org = await createOrg({ name, slug: uniqueSlug });
    await createMembership({
      user_id: session.user.id,
      org_id: org.id,
      role: 'admin'
    });

    return NextResponse.json({ org });
  } catch {
    return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
  }
}
