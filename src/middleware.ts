import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não definido nas variáveis de ambiente')
}

const secret = new TextEncoder().encode(JWT_SECRET)

export async function middleware(request: NextRequest) {
  
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth_token')?.value

  if (token && (pathname === '/login' || pathname === '/register')) {
    try {
      await jose.jwtVerify(token, secret)
      return NextResponse.redirect(new URL('/', request.url))
    } catch (error) {
    }
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  try {
    await jose.jwtVerify(token, secret)
    return NextResponse.next()
  } catch (error) {
    console.error('Erro de verificação do JWT no middleware:', error)
    const loginUrl = new URL('/login', request.url)
    
    loginUrl.searchParams.set('error', 'session_expired')
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('auth_token')
    return response
  }
}

export const config = {
  matcher: [
    '/((?!api/auth/|api/login|api/register|_next/static|_next/image|favicon.ico|login|register).*)',
  ],
}
