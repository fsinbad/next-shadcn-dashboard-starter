import { type NextRequest, NextResponse } from 'next/server';

const isProtectedRoute = (req: NextRequest) =>
  req.nextUrl.pathname.startsWith('/dashboard');

export default function middleware(req: NextRequest) {
  if (isProtectedRoute(req)) {
    const sessionToken = req.cookies.get('session_token')?.value;

    if (!sessionToken) {
      const signInUrl = new URL('/auth/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};
