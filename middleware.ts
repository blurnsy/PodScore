import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not signed in and the current path is not /auth or /verify,
  // redirect the user to /auth
  if (!session && !['/auth', '/verify'].includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // If user is signed in and the current path is /auth,
  // redirect the user to /
  if (session && request.nextUrl.pathname === '/auth') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 