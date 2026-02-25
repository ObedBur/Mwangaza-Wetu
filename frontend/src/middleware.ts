import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Vérifie la présence d'un jeton d'authentification dans les cookies.
 
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Protection des routes du dashboard
  // Si l'utilisateur n'est pas connecté, on le redirige vers la page de connexion
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const loginUrl = new URL('/', request.url);
      // Optionnel : ajouter l'URL de redirection pour y revenir après connexion
      // loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  } 

  // Si l'utilisateur est déjà connecté et tente d'accéder à la page de connexion,
  // on le redirige vers le dashboard
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

/**
 * Configuration du matcher pour appliquer le middleware uniquement sur les routes concernées.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.jpg, etc. (public assets)
     */
    '/dashboard/:path*',
    
    '/',
  ],
};
