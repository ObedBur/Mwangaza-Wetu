import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

export { CreateNotificationDto };

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Récupère toutes les notifications d'un membre (plus récentes d'abord) */
  async findByMembre(membreId: number) {
    return this.prisma.notification.findMany({
      where: { membreId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Récupère une notification par son ID */
  async findById(id: number) {
    return this.prisma.notification.findUnique({
      where: { id },
    });
  }

  /** Compte les notifications non lues d'un membre */
  async countUnread(membreId: number): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { membreId, isRead: false },
    });
    return { count };
  }

  /** Marque une notification spécifique comme lue */
  async markAsRead(id: number) {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif) throw new NotFoundException(`Notification #${id} introuvable`);
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  /** Marque toutes les notifications d'un membre comme lues */
  async markAllAsRead(membreId: number): Promise<{ updated: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { membreId, isRead: false },
      data: { isRead: true },
    });
    return { updated: result.count };
  }

  /** Crée une nouvelle notification (utilisé par d'autres services) */
  async create(dto: CreateNotificationDto) {
    if (!dto.membreId && !dto.adminId) {
      throw new Error("Une notification doit cibler un membre (membreId) ou un admin (adminId).");
    }
    return this.prisma.notification.create({
      data: {
        membreId: dto.membreId,
        adminId: dto.adminId,
        titre: dto.titre,
        message: dto.message,
        type: dto.type ?? 'info',
      },
    });
  }

  /**
   * --- MÉTHODES ADMINISTRATEURS ---
   */

  /** Récupère toutes les notifications d'un admin */
  async findByAdmin(adminId: number) {
    return this.prisma.notification.findMany({
      where: { adminId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Compte les notifications non lues d'un admin */
  async countUnreadAdmin(adminId: number): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { adminId, isRead: false },
    });
    return { count };
  }

  /** Marque toutes les notifications d'un admin comme lues */
  async markAllAsReadAdmin(adminId: number): Promise<{ updated: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { adminId, isRead: false },
      data: { isRead: true },
    });
    return { updated: result.count };
  }

  /** Notifie tous les administrateurs actifs d'un événement global */
  async notifyAllAdmins(titre: string, message: string, type: 'info' | 'success' | 'warning' | 'credit' | 'epargne' = 'info') {
    const admins = await this.prisma.administrateur.findMany({
      where: { actif: true },
      select: { id: true }
    });

    if (admins.length === 0) return { notified: 0 };

    const notificationsData = admins.map(admin => ({
      adminId: admin.id,
      membreId: null as any, // Contournement de l'erreur de typage prisma
      titre,
      message,
      type
    }));

    const result = await this.prisma.notification.createMany({
      data: notificationsData
    });

    return { notified: result.count };
  }

  /** Supprime une notification */
  async delete(id: number): Promise<{ deleted: boolean }> {
    await this.prisma.notification.delete({ where: { id } });
    return { deleted: true };
  }
}
