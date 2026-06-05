import { createClient } from '@libsql/client';
import { randomUUID } from 'crypto';
import path from 'path';

const DB_PATH = process.env.DATABASE_URL || path.join(process.cwd(), 'data', 'app.db');

let client: ReturnType<typeof createClient> | null = null;

export function getDb(): ReturnType<typeof createClient> {
  if (client) return client;

  client = createClient({ url: `file:${DB_PATH}` });
  initSchema(client);

  return client;
}

function initSchema(db: ReturnType<typeof createClient>) {
  db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      dingtalk_union_id TEXT UNIQUE NOT NULL,
      name TEXT,
      email TEXT,
      avatar_url TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      logo_url TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS memberships (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'member',
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
      UNIQUE(user_id, org_id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);
    CREATE INDEX IF NOT EXISTS idx_memberships_org ON memberships(org_id);
    CREATE INDEX IF NOT EXISTS idx_users_dingtalk ON users(dingtalk_union_id);
  `);
}

export function generateId(): string {
  return randomUUID();
}
