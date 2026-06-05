import { getDb, generateId } from './db';

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
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE dingtalk_union_id = ? LIMIT 1',
    args: [unionId]
  });
  return (result.rows[0] as unknown as DbUser | undefined) ?? undefined;
}

export async function findUserById(id: string): Promise<DbUser | undefined> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE id = ? LIMIT 1',
    args: [id]
  });
  return (result.rows[0] as unknown as DbUser | undefined) ?? undefined;
}

export async function createUser(data: {
  dingtalk_union_id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
}): Promise<DbUser> {
  const db = getDb();
  const id = generateId();
  const now = Math.floor(Date.now() / 1000);

  await db.execute({
    sql: `INSERT INTO users (id, dingtalk_union_id, name, email, avatar_url, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      data.dingtalk_union_id,
      data.name ?? null,
      data.email ?? null,
      data.avatar_url ?? null,
      now,
      now
    ]
  });

  return (await findUserById(id))!;
}

export async function updateUser(
  id: string,
  data: Partial<Pick<DbUser, 'name' | 'email' | 'avatar_url'>>
): Promise<DbUser> {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  const sets: string[] = [];
  const values: (string | null | number)[] = [];

  if (data.name !== undefined) {
    sets.push('name = ?');
    values.push(data.name);
  }
  if (data.email !== undefined) {
    sets.push('email = ?');
    values.push(data.email);
  }
  if (data.avatar_url !== undefined) {
    sets.push('avatar_url = ?');
    values.push(data.avatar_url);
  }

  sets.push('updated_at = ?');
  values.push(now);
  values.push(id);

  await db.execute({
    sql: `UPDATE users SET ${sets.join(', ')} WHERE id = ?`,
    args: values
  });

  return (await findUserById(id))!;
}

// ─── Organizations ───────────────────────────────────────────────────

export async function findOrgById(id: string): Promise<DbOrganization | undefined> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM organizations WHERE id = ? LIMIT 1',
    args: [id]
  });
  return (result.rows[0] as unknown as DbOrganization | undefined) ?? undefined;
}

export async function findOrgBySlug(slug: string): Promise<DbOrganization | undefined> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM organizations WHERE slug = ? LIMIT 1',
    args: [slug]
  });
  return (result.rows[0] as unknown as DbOrganization | undefined) ?? undefined;
}

export async function createOrg(data: {
  name: string;
  slug: string;
  logo_url?: string;
}): Promise<DbOrganization> {
  const db = getDb();
  const id = generateId();
  const now = Math.floor(Date.now() / 1000);

  await db.execute({
    sql: `INSERT INTO organizations (id, name, slug, logo_url, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, data.name, data.slug, data.logo_url ?? null, now, now]
  });

  return (await findOrgById(id))!;
}

// ─── Memberships ─────────────────────────────────────────────────────

export async function findMembershipsByUserId(
  userId: string
): Promise<(DbMembership & { org_name: string; org_slug: string })[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT m.*, o.name as org_name, o.slug as org_slug
          FROM memberships m
          JOIN organizations o ON m.org_id = o.id
          WHERE m.user_id = ?
          ORDER BY m.created_at ASC`,
    args: [userId]
  });
  return result.rows as unknown as (DbMembership & { org_name: string; org_slug: string })[];
}

export async function findMembership(
  userId: string,
  orgId: string
): Promise<DbMembership | undefined> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM memberships WHERE user_id = ? AND org_id = ? LIMIT 1',
    args: [userId, orgId]
  });
  return (result.rows[0] as unknown as DbMembership | undefined) ?? undefined;
}

export async function createMembership(data: {
  user_id: string;
  org_id: string;
  role?: string;
}): Promise<DbMembership> {
  const db = getDb();
  const id = generateId();
  const now = Math.floor(Date.now() / 1000);

  await db.execute({
    sql: `INSERT INTO memberships (id, user_id, org_id, role, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, data.user_id, data.org_id, data.role ?? 'member', now, now]
  });

  const result = await db.execute({
    sql: 'SELECT * FROM memberships WHERE id = ? LIMIT 1',
    args: [id]
  });
  return result.rows[0] as unknown as DbMembership;
}

// ─── Sessions ────────────────────────────────────────────────────────

export interface SessionWithUser {
  session: DbSession;
  user: DbUser;
}

export async function findSessionByToken(token: string): Promise<SessionWithUser | undefined> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT
            s.id as session_id,
            s.user_id as session_user_id,
            s.token,
            s.expires_at,
            s.created_at as session_created_at,
            u.id as user_id,
            u.dingtalk_union_id,
            u.name,
            u.email,
            u.avatar_url,
            u.created_at as user_created_at,
            u.updated_at as user_updated_at
          FROM sessions s
          JOIN users u ON s.user_id = u.id
          WHERE s.token = ? AND s.expires_at > unixepoch()
          LIMIT 1`,
    args: [token]
  });

  const row = result.rows[0] as unknown as
    | {
        session_id: string;
        session_user_id: string;
        token: string;
        expires_at: number;
        session_created_at: number;
        user_id: string;
        dingtalk_union_id: string;
        name: string | null;
        email: string | null;
        avatar_url: string | null;
        user_created_at: number;
        user_updated_at: number;
      }
    | undefined;

  if (!row) return undefined;

  return {
    session: {
      id: row.session_id,
      user_id: row.session_user_id,
      token: row.token,
      expires_at: row.expires_at,
      created_at: row.session_created_at
    },
    user: {
      id: row.user_id,
      dingtalk_union_id: row.dingtalk_union_id,
      name: row.name,
      email: row.email,
      avatar_url: row.avatar_url,
      created_at: row.user_created_at,
      updated_at: row.user_updated_at
    }
  };
}

export async function createSession(data: {
  user_id: string;
  token: string;
  expires_at: number;
}): Promise<DbSession> {
  const db = getDb();
  const id = generateId();
  const now = Math.floor(Date.now() / 1000);

  await db.execute({
    sql: `INSERT INTO sessions (id, user_id, token, expires_at, created_at)
          VALUES (?, ?, ?, ?, ?)`,
    args: [id, data.user_id, data.token, data.expires_at, now]
  });

  const result = await db.execute({
    sql: 'SELECT * FROM sessions WHERE id = ? LIMIT 1',
    args: [id]
  });
  return result.rows[0] as unknown as DbSession;
}

export async function deleteSessionByToken(token: string): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: 'DELETE FROM sessions WHERE token = ?',
    args: [token]
  });
}

export async function deleteExpiredSessions(): Promise<void> {
  const db = getDb();
  await db.execute('DELETE FROM sessions WHERE expires_at <= unixepoch()');
}

export async function deleteUserSessions(userId: string): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: 'DELETE FROM sessions WHERE user_id = ?',
    args: [userId]
  });
}
