import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /** GET /api/notifications/membre/:membreId — Liste des notifs d'un membre */
  @Get('membre/:membreId')
  async findByMembre(@Param('membreId', ParseIntPipe) membreId: number, @Req() req: any) {
    if (req.user.role === 'membre' && req.user.id !== membreId) {
      throw new ForbiddenException('Accès refusé. Vous ne pouvez consulter que vos propres notifications.');
    }
    return this.notificationsService.findByMembre(membreId);
  }

  /** GET /api/notifications/membre/:membreId/unread-count — Compteur non-lus */
  @Get('membre/:membreId/unread-count')
  async countUnread(@Param('membreId', ParseIntPipe) membreId: number, @Req() req: any) {
    if (req.user.role === 'membre' && req.user.id !== membreId) {
      throw new ForbiddenException('Accès refusé.');
    }
    return this.notificationsService.countUnread(membreId);
  }

  /** POST /api/notifications — Créer une notification */
  @Post()
  async create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  /** PATCH /api/notifications/:id/read — Marquer une notif comme lue */
  @Patch(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const notif = await this.notificationsService.findById(id);
    if (!notif) throw new ForbiddenException('Notification introuvable.');

    if (req.user.role === 'membre' && notif.membreId !== req.user.id) {
       throw new ForbiddenException('Accès refusé.');
    }
    if ((req.user.role === 'admin' || req.user.role === 'superadmin') && notif.adminId !== req.user.id && notif.adminId !== null && notif.membreId !== null) {
        // Un admin peut lire ses notifs.
        if (notif.adminId !== req.user.id) {
            throw new ForbiddenException('Accès refusé.');
        }
    }
    return this.notificationsService.markAsRead(id);
  }

  /** PATCH /api/notifications/membre/:membreId/read-all — Tout marquer lu */
  @Patch('membre/:membreId/read-all')
  async markAllAsRead(@Param('membreId', ParseIntPipe) membreId: number, @Req() req: any) {
    if (req.user.role === 'membre' && req.user.id !== membreId) {
      throw new ForbiddenException('Accès refusé.');
    }
    return this.notificationsService.markAllAsRead(membreId);
  }

  /**
   * --- ROUTES ADMINISTRATEURS ---
   */

  /** GET /api/notifications/admin/:adminId — Liste des notifs d'un admin */
  @Get('admin/:adminId')
  async findByAdmin(@Param('adminId', ParseIntPipe) adminId: number, @Req() req: any) {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      throw new ForbiddenException('Accès refusé.');
    }
    return this.notificationsService.findByAdmin(adminId);
  }

  /** GET /api/notifications/admin/:adminId/unread-count — Compteur non-lus admin */
  @Get('admin/:adminId/unread-count')
  async countUnreadAdmin(@Param('adminId', ParseIntPipe) adminId: number, @Req() req: any) {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      throw new ForbiddenException('Accès refusé.');
    }
    return this.notificationsService.countUnreadAdmin(adminId);
  }

  /** PATCH /api/notifications/admin/:adminId/read-all — Tout marquer lu pour un admin */
  @Patch('admin/:adminId/read-all')
  async markAllAsReadAdmin(@Param('adminId', ParseIntPipe) adminId: number, @Req() req: any) {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      throw new ForbiddenException('Accès refusé.');
    }
    return this.notificationsService.markAllAsReadAdmin(adminId);
  }

  /** DELETE /api/notifications/:id — Supprimer une notification */
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const notif = await this.notificationsService.findById(id);
    if (!notif) throw new ForbiddenException('Notification introuvable.');

    if (req.user.role === 'membre' && notif.membreId !== req.user.id) {
       throw new ForbiddenException('Accès refusé.');
    }
    if ((req.user.role === 'admin' || req.user.role === 'superadmin') && notif.adminId !== req.user.id && notif.adminId !== null) {
       throw new ForbiddenException('Accès refusé.');
    }
    return this.notificationsService.delete(id);
  }
}
