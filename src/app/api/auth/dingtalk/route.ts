import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { buildDingTalkAuthUrl } from '@/lib/dingtalk';

export async function GET() {
  const state = randomBytes(16).toString('hex');

  const cookieStore = await cookies();
  cookieStore.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/'
  });

  const url = buildDingTalkAuthUrl(state);
  return NextResponse.redirect(url);
}
