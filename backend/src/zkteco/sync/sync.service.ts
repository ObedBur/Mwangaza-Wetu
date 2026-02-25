import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ZktecoService } from '../zkteco.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly zkteco: ZktecoService,
    private readonly prisma: PrismaService,
  ) {}

  async syncAllAttendances() {
    try {
      const logs = await this.zkteco.getAttendances();
      this.logger.log(`Récupération de ${logs.length} logs depuis l'appareil`);

      const recentLogs = logs.filter(log => {
        const dateStr = log.recordTime || log.timestamp;
        if (!dateStr) return false;
        const year = new Date(dateStr).getFullYear();
        return year >= 2024;
      });

      this.logger.log(`${recentLogs.length} logs récents à synchroniser`);

      for (const log of recentLogs) {
        const uid = log.userSn?.toString() || log.userId?.toString();
        const timestamp = new Date(log.recordTime || log.timestamp);

        if (!uid || isNaN(timestamp.getTime())) {
          this.logger.warn('Log ignoré (UID ou timestamp invalide):', log);
          continue;
        }

        // Vérifier si ce log existe déjà
        const existing = await this.prisma.attendance.findFirst({
          where: {
            uid: uid,
            timestamp: timestamp,
          },
        });

        if (!existing) {
          // Chercher le membre correspondant via son userId (UID de l'appareil)
          const membre = await this.prisma.membre.findFirst({
            where: { userId: uid },
          });

          if (membre) {
            await this.prisma.attendance.create({
              data: {
                uid: uid,
                timestamp: timestamp,
                membreId: membre.id,
              },
            });
            this.logger.debug(`Log ajouté pour le membre ${membre.nomComplet} (${uid}) à ${timestamp}`);
          } else {
            this.logger.warn(`Aucun membre trouvé pour l'UID ${uid} – log ignoré`);
          }
        }
      }

      this.logger.log('Synchronisation terminée');
    } catch (error) {
      this.logger.error('Erreur lors de la synchronisation', error);
    }
  }

  async startRealTimeListener() {
    await this.zkteco.getRealTimeLogs(async (log) => {
      this.logger.debug('Nouveau log reçu en temps réel:', log);

      const uid = log.userSn?.toString() || log.userId?.toString();
      const timestamp = new Date(log.recordTime || log.timestamp);

      if (!uid || isNaN(timestamp.getTime())) {
        this.logger.warn('Log temps réel ignoré (UID ou timestamp invalide)');
        return;
      }

      const membre = await this.prisma.membre.findFirst({
        where: { userId: uid },
      });

      if (membre) {
        const existing = await this.prisma.attendance.findFirst({
          where: { uid, timestamp },
        });
        if (!existing) {
          await this.prisma.attendance.create({
            data: {
              uid: uid,
              timestamp: timestamp,
              membreId: membre.id,
            },
          });
          this.logger.log(`Nouveau log temps réel enregistré pour ${membre.nomComplet}`);
        }
      } else {
        this.logger.warn(`Aucun membre trouvé pour l'UID ${uid} (log temps réel ignoré)`);
      }
    });
  }
}