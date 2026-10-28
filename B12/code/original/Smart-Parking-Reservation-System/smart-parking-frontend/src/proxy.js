import { NextResponse } from 'next/server';

export function proxy(request) {
  const token = request.cookies.get('token')?.value;
  const userCookie = request.cookies.get('user')?.value;

  const { pathname } = request.nextUrl;

  // Handle root path
  if (pathname === '/') {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token && userCookie) {
      try {
        const user = JSON.parse(userCookie);
        if (user.role === 'admin') {
          return NextResponse.redirect(new URL('/dashboard/admin', request.url));
        }
        return NextResponse.redirect(new URL('/dashboard/user', request.url));
      } catch (error) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  }

  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && userCookie && pathname.startsWith('/dashboard/admin')) {
    try {
      const user = JSON.parse(userCookie);

      if (user.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard/user', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (token && userCookie && pathname.startsWith('/dashboard/user')) {
    try {
      const user = JSON.parse(userCookie);

      if (user.role === 'admin') {
        return NextResponse.redirect(new URL('/dashboard/admin', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};