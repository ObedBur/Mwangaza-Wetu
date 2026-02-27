/**
 * Centralisation des routes API backend.
 * Le baseURL de l'apiClient inclut déjà '/api',
 * donc ces constantes n'incluent PAS le préfixe '/api'.
 *
 * Convention :
 *   apiClient.get(API_ROUTES.MEMBRES)  →  GET /api/membres
 */

export const API_ROUTES = {
  // ─── Membres ──────────────────────────────────────
  MEMBRES: '/membres',
  MEMBRES_STATS: '/membres/stats',
  MEMBRES_NUMEROS: '/membres/numeros',
  MEMBRES_GENERATE_NUMERO: '/membres/generate-numero',
  MEMBRES_BY_ZKID: '/membres/by-zkid',
  MEMBRES_SEARCH: '/membres/search',

  // ─── Épargnes ─────────────────────────────────────
  EPARGNES: '/epargnes',

  // ─── Crédits ──────────────────────────────────────
  CREDITS: '/credits',
  CREDITS_STATS: '/credits/stats',

  // ─── Biométrie ────────────────────────────────────
  BIOMETRIC: '/biometric',

  // ─── Retraits (Withdrawals) ───────────────────────
  WITHDRAWALS: '/withdrawals',

  // ─── Remboursements ───────────────────────────────
  REMBOURSEMENTS: '/remboursements',

  // ─── Solde (Balances) ─────────────────────────────
  SOLDE: '/solde',

  // ─── Auth ─────────────────────────────────────────
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_ME: '/auth/me',              // Profil utilisateur connecté
  AUTH_REFRESH: '/auth/refresh',
  
  // ─── Guichets ─────────────────────────────────────
  GUICHETS: '/guichets',           // ✅ Tu as la page mais pas la route
  
  // ─── Comptabilité ─────────────────────────────────
  COMPTABILITE: '/comptabilite', 
  
  // ─── Admin ────────────────────────────────────────
  ADMIN: '/admin',

  // ─── Paramètres ───────────────────────────────────
  PARAMETRES: '/parametres',

  // ─── Rapports ─────────────────────────────────────
  RAPPORTS: '/rapport',

  // ─── Routes en attente de backend ─────────────────
  // CASHIERS: '/cashiers',       // TODO: pas de contrôleur backend encore
  // ACCOUNTING: '/accounting',   // TODO: pas de contrôleur backend encore
} as const;

/** Type union de toutes les routes disponibles */
export type ApiRoute = (typeof API_ROUTES)[keyof typeof API_ROUTES];

/** Helper pour construire une route avec un paramètre ID */
export const withId = (route: string, id: number | string): string =>
  `${route}/${id}`;
