import { prisma, generateId } from './db';

// ─── Types ───────────────────────────────────────────────────────────

export interface DbUser {
  id: string;
  dingtalk_union_id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: number;
  updated_at: number;
}

export interface DbOrganization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: number;
  updated_at: number;
}

export interface DbMembership {
  id: string;
  user_id: string;
  org_id: string;
  role: string;
  created_at: number;
  updated_at: number;
}

export interface DbSession {
  id: string;
  user_id: string;
  token: string;
  expires_at: number;
  created_at: number;
}

// ─── Users ───────────────────────────────────────────────────────────

export async function findUserByDingTalkUnionId(unionId: string): Promise<DbUser | undefined> {
  const user = await prisma.user.findUnique({
    where: { dingtalk_union_id: unionId }
  });
  return user ?? undefined;
}

export async function findUserById(id: string): Promise<DbUser | undefined> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ?? undefined;
}

export async function createUser(data: {
  dingtalk_union_id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
}): Promise<DbUser> {
  const now = Math.floor(Date.now() / 1000);
  return await prisma.user.create({
    data: {
      id: generateId(),
      dingtalk_union_id: data.dingtalk_union_id,
      name: data.name ?? null,
      email: data.email ?? null,
      avatar_url: data.avatar_url ?? null,
      created_at: now,
      updated_at: now
    }
  });
}

export async function updateUser(
  id: string,
  data: Partial<Pick<DbUser, 'name' | 'email' | 'avatar_url'>>
): Promise<DbUser> {
  const now = Math.floor(Date.now() / 1000);
  return await prisma.user.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.avatar_url !== undefined && { avatar_url: data.avatar_url }),
      updated_at: now
    }
  });
}

// ─── Organizations ───────────────────────────────────────────────────

export async function findOrgById(id: string): Promise<DbOrganization | undefined> {
  const org = await prisma.organization.findUnique({ where: { id } });
  return org ?? undefined;
}

export async function findOrgBySlug(slug: string): Promise<DbOrganization | undefined> {
  const org = await prisma.organization.findUnique({ where: { slug } });
  return org ?? undefined;
}

export async function createOrg(data: {
  name: string;
  slug: string;
  logo_url?: string;
}): Promise<DbOrganization> {
  const now = Math.floor(Date.now() / 1000);
  return await prisma.organization.create({
    data: {
      id: generateId(),
      name: data.name,
      slug: data.slug,
      logo_url: data.logo_url ?? null,
      created_at: now,
      updated_at: now
    }
  });
}

export async function updateOrg(
  id: string,
  data: Partial<Pick<DbOrganization, 'name' | 'slug' | 'logo_url'>>
): Promise<DbOrganization> {
  const now = Math.floor(Date.now() / 1000);
  return await prisma.organization.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.logo_url !== undefined && { logo_url: data.logo_url }),
      updated_at: now
    }
  });
}

export async function deleteOrg(id: string): Promise<void> {
  await prisma.organization.delete({ where: { id } });
}

// ─── Memberships ─────────────────────────────────────────────────────

export async function findMembershipsByUserId(
  userId: string
): Promise<(DbMembership & { org_name: string; org_slug: string })[]> {
  const rows = await prisma.membership.findMany({
    where: { user_id: userId },
    include: { organization: true },
    orderBy: { created_at: 'asc' }
  });
  return rows.map((m) => ({
    id: m.id,
    user_id: m.user_id,
    org_id: m.org_id,
    role: m.role,
    created_at: m.created_at,
    updated_at: m.updated_at,
    org_name: m.organization.name,
    org_slug: m.organization.slug
  }));
}

export async function findMembership(
  userId: string,
  orgId: string
): Promise<DbMembership | undefined> {
  const m = await prisma.membership.findUnique({
    where: { user_id_org_id: { user_id: userId, org_id: orgId } }
  });
  return m ?? undefined;
}

export async function findOrgMembers(orgId: string): Promise<
  (DbMembership & {
    user_name: string | null;
    user_email: string | null;
    user_avatar: string | null;
  })[]
> {
  const rows = await prisma.membership.findMany({
    where: { org_id: orgId },
    include: { user: true },
    orderBy: [{ role: 'desc' }, { created_at: 'asc' }]
  });
  return rows.map((m) => ({
    id: m.id,
    user_id: m.user_id,
    org_id: m.org_id,
    role: m.role,
    created_at: m.created_at,
    updated_at: m.updated_at,
    user_name: m.user.name,
    user_email: m.user.email,
    user_avatar: m.user.avatar_url
  }));
}

export async function createMembership(data: {
  user_id: string;
  org_id: string;
  role?: string;
}): Promise<DbMembership> {
  const now = Math.floor(Date.now() / 1000);
  return await prisma.membership.create({
    data: {
      id: generateId(),
      user_id: data.user_id,
      org_id: data.org_id,
      role: data.role ?? 'member',
      created_at: now,
      updated_at: now
    }
  });
}

// ─── Sessions ────────────────────────────────────────────────────────

export interface SessionWithUser {
  session: DbSession;
  user: DbUser;
}

export async function findSessionByToken(token: string): Promise<SessionWithUser | undefined> {
  const now = Math.floor(Date.now() / 1000);
  const row = await prisma.session.findFirst({
    where: { token, expires_at: { gt: now } },
    include: { user: true }
  });
  if (!row) return undefined;
  return {
    session: {
      id: row.id,
      user_id: row.user_id,
      token: row.token,
      expires_at: row.expires_at,
      created_at: row.created_at
    },
    user: row.user
  };
}

export async function createSession(data: {
  user_id: string;
  token: string;
  expires_at: number;
}): Promise<DbSession> {
  const now = Math.floor(Date.now() / 1000);
  return await prisma.session.create({
    data: {
      id: generateId(),
      user_id: data.user_id,
      token: data.token,
      expires_at: data.expires_at,
      created_at: now
    }
  });
}

export async function deleteSessionByToken(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { token } });
}

export async function deleteExpiredSessions(): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await prisma.session.deleteMany({
    where: { expires_at: { lte: now } }
  });
}

export async function deleteUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { user_id: userId } });
}
