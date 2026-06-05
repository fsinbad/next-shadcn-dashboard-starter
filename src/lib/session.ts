import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';
import { createSession, findSessionByToken, deleteSessionByToken } from './db-queries';

const SESSION_COOKIE = 'session_token';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export async function createUserSession(userId: string) {
  const token = generateSessionToken();
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;

  const session = await createSession({
    user_id: userId,
    token,
    expires_at: expiresAt
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/'
  });

  return session;
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return undefined;

  const sessionWithUser = await findSessionByToken(token);
  if (!sessionWithUser) {
    cookieStore.delete(SESSION_COOKIE);
    return undefined;
  }

  return sessionWithUser;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await deleteSessionByToken(token);
  }

  cookieStore.delete(SESSION_COOKIE);
}
