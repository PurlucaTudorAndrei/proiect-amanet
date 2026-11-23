import { NextResponse } from 'next/server';
import { decryptSession } from '@/lib/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('amanet_session')?.value;
  const session = sessionCookie ? await decryptSession(sessionCookie) : null;

  const ruteInterne = ['/dashboard', '/contracte', '/vanzari', '/clienti'];
  const esteRutaInterna = ruteInterne.some((ruta) => pathname.startsWith(ruta));
  const esteRutaClient = pathname.startsWith('/contul-meu');

  if (!session && (esteRutaInterna || esteRutaClient)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session?.rol === 'CLIENT' && esteRutaInterna) {
    return NextResponse.redirect(new URL('/contul-meu', request.url));
  }

  if (session && pathname === '/login') {
    const dest = session.rol === 'CLIENT' ? '/contul-meu' : '/dashboard';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/contracte/:path*',
    '/vanzari/:path*',
    '/clienti/:path*',
    '/contul-meu/:path*',
    '/login',
  ],
};