# Authentication Setup Guide

This guide covers the setup and configuration of the authentication system used in this starter template.

## Authentication System

This project uses **DingTalk OAuth 2.0** for user authentication with a **SQLite** local database for storing users, organizations, memberships, and sessions.

## Required Environment Variables

Copy `env.example.txt` to `.env.local` and configure:

```env
DINGTALK_APP_KEY=          # Your DingTalk AppKey
DINGTALK_APP_SECRET=       # Your DingTalk AppSecret
DINGTALK_REDIRECT_URI=     # Example: http://localhost:3000/api/auth/callback
NEXT_PUBLIC_APP_URL=       # Example: http://localhost:3000
DATABASE_URL=              # SQLite file path, defaults to ./data/app.db
```

## DingTalk OAuth Setup

1. Register your application at [DingTalk Open Platform](https://open.dingtalk.com)
2. Create an app and obtain the **AppKey** (Client ID) and **AppSecret** (Client Secret)
3. Configure the redirect URI to match your `DINGTALK_REDIRECT_URI`
4. Enable required permissions (e.g., `Contact.User.Read`)

## Multi-Tenant Workspaces

This starter kit includes multi-tenant workspace management powered by a custom organization system backed by SQLite.

### How It Works

- When a user first logs in via DingTalk, a default personal workspace is automatically created
- Users can switch between workspaces via the org switcher in the sidebar
- Workspace membership and roles are stored in the `memberships` table

### Server-Side Permission Checks

Use the `auth()` function from `src/lib/auth.ts` to check authentication and organization context:

```typescript
import { auth } from '@/lib/auth';

const { userId, orgId, org } = await auth();
if (!userId) redirect('/auth/sign-in');
if (!orgId) redirect('/dashboard/workspaces');
```

### Navigation RBAC System

- Fully client-side navigation filtering using `useNav` hook
- Supports `requireOrg`, `permission`, and `role` checks (all client-side, instant)
- Configured in `src/config/nav-config.ts` with `access` properties
- See `docs/nav-rbac.md` for detailed documentation

## Database Schema

The SQLite database includes the following tables:

- **users** - User accounts linked to DingTalk union IDs
- **organizations** - Workspaces/teams
- **memberships** - User membership in organizations with roles
- **sessions** - Cookie-based session tokens

For more information, see `src/lib/db.ts` and `src/lib/db-queries.ts`.
