import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Créer le client Supabase avec les cookies
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    
    // Vérifier la session
    const { data: { session } } = await supabase.auth.getSession()

    console.log('Middleware - URL:', request.nextUrl.pathname)
    console.log('Middleware - Session:', session ? 'Présente' : 'Absente')
    console.log('Middleware - Cookies:', cookieStore.getAll())

    // Si l'utilisateur est sur la page d'authentification et qu'il a une session
    if (request.nextUrl.pathname === '/auth' && session) {
      console.log('Middleware - Redirection vers /dashboard car session présente')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Si l'utilisateur essaie d'accéder à /dashboard sans session
    if (request.nextUrl.pathname === '/dashboard' && !session) {
      console.log('Middleware - Redirection vers /auth car pas de session')
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware Error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 