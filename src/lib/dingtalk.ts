const DINGTALK_AUTH_URL = 'https://login.dingtalk.com/oauth2/auth';
const DINGTALK_TOKEN_URL = 'https://api.dingtalk.com/v1.0/oauth2/userAccessToken';
const DINGTALK_USER_URL = 'https://api.dingtalk.com/v1.0/contact/users/me';

function getAppKey(): string {
  const id = process.env.DINGTALK_APP_KEY;
  if (!id) throw new Error('Missing DINGTALK_APP_KEY env variable');
  return id;
}

function getAppSecret(): string {
  const secret = process.env.DINGTALK_APP_SECRET;
  if (!secret) throw new Error('Missing DINGTALK_APP_SECRET env variable');
  return secret;
}

function getRedirectUri(): string {
  const uri =
    process.env.DINGTALK_REDIRECT_URI ?? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
  if (!uri) throw new Error('Missing DINGTALK_REDIRECT_URI env variable');
  return uri;
}

export function buildDingTalkAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: getAppKey(),
    response_type: 'code',
    scope: 'openid',
    state,
    redirect_uri: getRedirectUri(),
    prompt: 'consent'
  });
  return `${DINGTALK_AUTH_URL}?${params.toString()}`;
}

interface DingTalkTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expireIn: number;
}

export async function exchangeCodeForToken(code: string): Promise<DingTalkTokenResponse> {
  const response = await fetch(DINGTALK_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: getAppKey(),
      clientSecret: getAppSecret(),
      code,
      grantType: 'authorization_code'
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DingTalk token exchange failed: ${response.status} ${text}`);
  }

  return response.json();
}

interface DingTalkUserInfo {
  nick: string;
  unionId: string;
  avatarUrl?: string;
  openId: string;
  mobile?: string;
  stateCode?: string;
  email?: string;
}

export async function fetchDingTalkUserInfo(accessToken: string): Promise<DingTalkUserInfo> {
  const response = await fetch(DINGTALK_USER_URL, {
    method: 'GET',
    headers: {
      'x-acs-dingtalk-access-token': accessToken,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DingTalk user info failed: ${response.status} ${text}`);
  }

  return response.json();
}
