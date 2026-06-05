import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, fetchDingTalkUserInfo } from '@/lib/dingtalk';
import {
  findUserByDingTalkUnionId,
  createUser,
  updateUser,
  createOrg,
  createMembership
} from '@/lib/db-queries';
import { createUserSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();

  // ─── Verify state ─────────────────────────────────────────────────
  const storedState = cookieStore.get('oauth_state')?.value;
  const urlState = request.nextUrl.searchParams.get('state');

  if (!storedState || !urlState || storedState !== urlState) {
    return NextResponse.redirect(new URL('/auth/sign-in?error=invalid_state', request.url));
  }

  cookieStore.delete('oauth_state');

  // ─── Get auth code ────────────────────────────────────────────────
  // DingTalk returns "authCode" instead of "code"
  const code =
    request.nextUrl.searchParams.get('authCode') || request.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/auth/sign-in?error=no_code', request.url));
  }

  try {
    // ─── Exchange code for token ────────────────────────────────────
    const tokenData = await exchangeCodeForToken(code);

    // ─── Fetch user info ────────────────────────────────────────────
    const dingUser = await fetchDingTalkUserInfo(tokenData.accessToken);

    // ─── Find or create user ────────────────────────────────────────
    let user = await findUserByDingTalkUnionId(dingUser.unionId);

    if (user) {
      user = await updateUser(user.id, {
        name: dingUser.nick,
        email: dingUser.email,
        avatar_url: dingUser.avatarUrl
      });
    } else {
      user = await createUser({
        dingtalk_union_id: dingUser.unionId,
        name: dingUser.nick,
        email: dingUser.email,
        avatar_url: dingUser.avatarUrl
      });

      // Create a default personal organization for new users
      const org = await createOrg({
        name: `${dingUser.nick}'s Workspace`,
        slug: `workspace-${user.id.slice(0, 8)}`
      });

      await createMembership({
        user_id: user.id,
        org_id: org.id,
        role: 'admin'
      });
    }

    // ─── Create session ─────────────────────────────────────────────
    await createUserSession(user.id);

    return NextResponse.redirect(new URL('/dashboard/overview', request.url));
  } catch (err) {
    console.error('DingTalk callback error:', err);
    return NextResponse.redirect(new URL('/auth/sign-in?error=oauth_failed', request.url));
  }
}
