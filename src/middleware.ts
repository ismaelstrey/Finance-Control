import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

// Rotas que requerem autenticação
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/transactions',
  '/reports',
  '/categories'
]

// Rotas que só devem ser acessadas por usuários não autenticados
const authRoutes = [
  '/login',
  '/register'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  try {
    // Verifica a sessão usando a função do Better Auth
    const sessionCookie = getSessionCookie(request)
    const isAuthenticated = !!sessionCookie

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

    // Se está tentando acessar uma rota protegida sem estar autenticado
    if (isProtectedRoute && !isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Se está autenticado e tentando acessar rotas de auth (login/register)
    if (isAuthRoute && isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error)

    // Em caso de erro, redireciona para login se for rota protegida
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}