/**
 * Types Membres — Alignés sur le modèle Prisma `Membre` du backend.
 */

export type Sexe = 'M' | 'F';
export type StatutMembre = 'actif' | 'inactif';

/**
 * MemberRecord correspond à la structure renvoyée par GET /api/membres.
 * Les noms de champs reflètent le modèle Prisma (camelCase français).
 */
export interface MemberRecord {
  id: number;
  numeroCompte: string;
  nomComplet: string;
  dateAdhesion: string;
  telephone: string;
  email?: string | null;
  adresse?: string | null;
  sexe?: Sexe | null;
  typeCompte: string;
  statut: StatutMembre;
  photoProfil?: string | null;
  userId?: string | null;
  dateNaissance?: string | null;
  idNationale?: string | null;
  delegues?: {
    id: number;
    nom: string;
    telephone: string;
    relation: string;
    userId?: string | null;
    photoProfil?: string | null;
  }[];
  createdAt: string;
  updatedAt: string;
}
