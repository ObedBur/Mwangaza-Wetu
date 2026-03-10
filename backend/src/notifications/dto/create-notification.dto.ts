export class CreateNotificationDto {
  membreId?: number; // Optionnel : si membreId est présent, la notification est pour un membre
  adminId?: number;  // Optionnel : si adminId est présent, la notification est pour un administrateur
  titre!: string;
  message!: string;
  type?: 'info' | 'success' | 'warning' | 'credit' | 'epargne';
}
