/**
 * Utilitaires pour la gestion des cookies d'authentification sans librairie externe.
 * Compatible avec le Client Side (document.cookie).
 * Note : Pour le Server Side (SSR), utilisez 'next/headers'.
 */

export const COOKIE_NAME = 'token';
export const USER_COOKIE_NAME = 'auth_user';

/**
 * Définit un cookie
 */
export const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof document === 'undefined') return;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  // path=/ est crucial pour que le middleware puisse lire le cookie sur toutes les routes
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax;${process.env.NODE_ENV === 'production' ? 'Secure' : ''
    }`;
};

/**
 * Récupère la valeur d'un cookie par son nom (Côté Client uniquement)
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length));
  }
  return null;
};

/**
 * Supprime un cookie
 */
export const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Max-Age=-99999999;path=/;SameSite=Lax;${process.env.NODE_ENV === 'production' ? 'Secure' : ''
    }`;
};

/**
 * Helpers spécifiques à l'authentification
 */
export const setAuthCookies = (token: string, user: any) => {
  setCookie(COOKIE_NAME, token);
  setCookie(USER_COOKIE_NAME, JSON.stringify(user));
};

export const removeAuthCookies = () => {
  deleteCookie(COOKIE_NAME);
  deleteCookie(USER_COOKIE_NAME);
};
