/**
   * Énumération des rôles utilisateurs pour le contrôle d'accès.
   * Doit correspondre à l'énumération Role définie dans schema.prisma.
   */
export enum Role {
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
  MEMBRE = 'membre', // Ajouté pour faciliter la gestion dans les gardes
}
