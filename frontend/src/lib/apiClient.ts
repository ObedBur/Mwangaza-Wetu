import axios, { AxiosError } from 'axios';
import { getCookie, removeAuthCookies, COOKIE_NAME } from './cookies';

/**
 * Instance Axios configurée pour l'API Mwangaza Wetu.
 * Compatible avec le Client Side et le Server Side (SSR).
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/** 
 * Parcourt récursivement un objet et convertit chaque Date en ISO string 
 * Utile pour l'envoi de données complexes au backend NestJS/Prisma.
 */
const convertDatesToISO = (obj: unknown): unknown => {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(convertDatesToISO);
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const key in obj as Record<string, unknown>) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = convertDatesToISO((obj as Record<string, unknown>)[key]);
      }
    }
    return result;
  }
  return obj;
};

export interface ApiError {
  message: string;
  status: number;
  data?: unknown;
}

/**
 * INTERCEPTEUR DE REQUÊTE
 * Gère l'injection automatique du token bearer.
 */
apiClient.interceptors.request.use(
  (config) => {
    // 1. Conversion automatique des Dates
    if (config.data) {
      config.data = convertDatesToISO(config.data);
    }

    // 2. Injection du token
    // On ne l'injecte que si le header n'est pas déjà présent (permet l'injection manuelle côté SSR)
    if (!config.headers.Authorization) {
      const token = getCookie(COOKIE_NAME);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * INTERCEPTEUR DE RÉPONSE
 * Gère la normalisation des erreurs et la déconnexion automatique (401).
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status ?? 0;
    const responseData = error.response?.data as Record<string, unknown> | undefined;

    // Normalisation du message d'erreur NestJS
    const message: string =
      (responseData?.message as string) ??
      (Array.isArray(responseData?.message)
        ? (responseData?.message as string[]).join(', ')
        : (responseData?.message as any)?.message) ??
      error.message ??
      'Une erreur inattendue est survenue.';

    // Gestion de l'expiration de session (401)
    // On ne redirige pas si on est déjà sur une route d'authentification
    const isAuthRoute = error.config?.url?.includes('/auth/');
    if (status === 401 && !isAuthRoute && typeof window !== 'undefined') {
      removeAuthCookies();
      window.location.href = '/';
    }

    const normalizedError: ApiError = {
      message,
      status,
      data: responseData,
    };

    return Promise.reject(normalizedError);
  },
);
