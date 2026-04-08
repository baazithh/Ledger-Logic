import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('ledger_auth');
  const path = request.nextUrl.pathname;

  const isLoginPage = path === '/login';
  const isPublicPage = path === '/'; // Define the Home Page as public

  // 1. If not logged in and trying to access anything EXCEPT /login or /
  if (!authCookie && !isLoginPage && !isPublicPage) {
    // Redirect back to login and include a hint so the login UI can
    // show a "login required" overlay when the user clicks protected links.
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('auth', 'required');
    return NextResponse.redirect(redirectUrl);
  }

  // 2. If logged in and trying to go to the login page, send them to inventory
  if (authCookie && isLoginPage) {
    return NextResponse.redirect(new URL('/inventory', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};