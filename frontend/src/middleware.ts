import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/'];
const PROTECTED_PREFIX = '/dashboard';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // ✅ Gestion des requêtes API (CORS et proxy)
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    
    // Headers CORS pour le développement
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }

  // ✅ Protection des routes dashboard
  if (pathname.startsWith(PROTECTED_PREFIX)) {
    if (!token) {
      const loginUrl = new URL('/', request.url);
      // ✅ ACTIVE le callbackUrl — c'est important !
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // ✅ Vérification basique du JWT (structure)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // ✅ Vérifier l'expiration
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        const response = NextResponse.redirect(new URL('/', request.url));
        response.cookies.delete('token');
        return response;
      }
    } catch {
      // Token malformé → déconnecter
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // ✅ Redirection si déjà connecté
  if (PUBLIC_ROUTES.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/', '/api/:path*'],
};