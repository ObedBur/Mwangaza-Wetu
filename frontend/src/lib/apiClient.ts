import axios, { AxiosError } from 'axios';

// ─── Instance Axios ────────────────────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Parcourt récursivement un objet et convertit chaque Date en ISO string */
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

/** Format d'erreur normalisé renvoyé par l'intercepteur de réponse */
export interface ApiError {
  message: string;
  status: number;
  data?: unknown;
}

// ─── Intercepteur de REQUÊTE ───────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // 1. Conversion automatique des objets Date en ISO strings
    if (config.data) {
      config.data = convertDatesToISO(config.data);
    }

    // 2. Injection du token JWT depuis localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Intercepteur de RÉPONSE ───────────────────────────────────────────────────
apiClient.interceptors.response.use(
  // Succès : on laisse passer la réponse telle quelle
  (response) => response,

  // Erreur : on normalise le format
  (error: AxiosError) => {
    const status = error.response?.status ?? 0;
    const responseData = error.response?.data as Record<string, unknown> | undefined;

    // Extraire le message de l'erreur depuis la réponse backend (NestJS)
    const message: string =
      (responseData?.message as string) ??
      (Array.isArray(responseData?.message)
        ? (responseData?.message as string[]).join(', ')
        : null) ??
      error.message ??
      'Une erreur inattendue est survenue.';

    // Gestion spéciale 401 – token expiré ou invalide
    if (status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      // Redirection vers la page de connexion (sans dépendance Next.js router)
      window.location.href = '/login';
    }

    const normalizedError: ApiError = {
      message,
      status,
      data: responseData,
    };

    return Promise.reject(normalizedError);
  },
);
