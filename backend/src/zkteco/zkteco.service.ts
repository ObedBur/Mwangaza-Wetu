// src/zkteco/zkteco.service.ts
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

// node-zklib utilise module.exports = ZKLib (CommonJS)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ZKLib = require('node-zklib');

@Injectable()
export class ZktecoService implements OnModuleDestroy {
  private readonly logger = new Logger(ZktecoService.name);
  private zkInstance: any;
  private isConnected = false;

  // Configuration de l'appareil
  private readonly ip = '192.168.1.222';
  private readonly port = 4370;
  private readonly timeout = 10000;
  private readonly inport = 4000; 

  /**
   * Se connecte à l'appareil ZKTeco
   * La lib utilise createSocket() pour initier la connexion TCP/UDP
   */
  async connect(): Promise<boolean> {
    if (this.isConnected) return true;

    try {
      this.zkInstance = new ZKLib(this.ip, this.port, this.timeout, this.inport);

      // createSocket() est la vraie méthode de connexion dans node-zklib
      await this.zkInstance.createSocket(
        (err: any) => {
          this.logger.error('Erreur socket ZKTeco :', err?.message || err);
          this.isConnected = false;
        },
        () => {
          this.logger.warn('Socket ZKTeco fermé');
          this.isConnected = false;
        },
      );

      // Correction de la fuite de mémoire : augmenter la limite de listeners sur le socket interne
      if (this.zkInstance.zsock) {
        this.zkInstance.zsock.setMaxListeners(100);
      }

      this.isConnected = true;
      this.logger.log(`Connecté avec succès à l'appareil ZKTeco ${this.ip}`);

      const info = await this.zkInstance.getInfo();
      this.logger.debug('Info appareil :', info);

      return true;
    } catch (error) {
      this.isConnected = false;
      this.logger.error('Échec de la connexion à l\'appareil ZKTeco :', error.message || error);
      throw error;
    }
  }

  /**
   * Déconnexion propre
   */
  async disconnect(): Promise<void> {
    if (this.zkInstance && this.isConnected) {
      try {
        await this.zkInstance.disconnect();
        this.logger.log('Déconnecté proprement de l\'appareil');
      } catch (error) {
        this.logger.warn('Erreur lors de la déconnexion (ignorée) :', error.message);
      } finally {
        this.isConnected = false;
      }
    }
  }

  private async ensureConnection(): Promise<void> {
    if (!this.isConnected || !this.zkInstance) {
      await this.connect();
    }
  }

  async getUsers(): Promise<any[]> {
    await this.ensureConnection();
    try {
      const users = await this.zkInstance.getUsers();
      this.logger.log(`Récupéré ${users?.data?.length ?? 0} utilisateurs`);
      return users?.data || users || [];
    } catch (error) {
      this.logger.error('Erreur getUsers :', error.message || error);
      throw error;
    }
  }

  async getAttendances(): Promise<any[]> {
    await this.ensureConnection();
    try {
      const attendances = await this.zkInstance.getAttendances();
      this.logger.log(`Récupéré ${attendances?.data?.length ?? 0} logs de présence`);
      return attendances?.data || attendances || [];
    } catch (error) {
      this.logger.error('Erreur getAttendances :', error.message || error);
      throw error;
    }
  }

  /**
   * EFFACEMENT DES LOGS
   * Méthode réelle dans node-zklib : clearAttendanceLog()
   */
  async clearAttendance(): Promise<void> {
    await this.ensureConnection();

    this.logger.warn('⚠️ Tentative d\'effacement de TOUS les logs de présence sur l\'appareil...');

    try {
      const result = await this.zkInstance.clearAttendanceLog();
      this.logger.log('Logs de présence effacés avec succès !', result);
    } catch (error: any) {
      if (error.message?.includes('command not supported') ||
        error.message?.includes('Execute command failed') ||
        error.code === -5 ||
        error.code === -1008) {
        this.logger.error('Cet appareil ne permet PAS l\'effacement des logs à distance (modèle limité).');
        this.logger.error('→ Il faut effacer physiquement sur l\'écran : Menu → Data Mng → Clear Attendance');
      } else {
        this.logger.error('Échec du clearAttendanceLog :', error.message || error);
      }
      throw error;
    }
  }

  /**
   * Temps réel – utilise getRealTimeLogs() de node-zklib
   */
  async startRealtime(callback: (log: any) => void): Promise<void> {
    await this.ensureConnection();
    this.logger.log('Démarrage de l\'écoute en temps réel...');

    try {
      await this.zkInstance.getRealTimeLogs((data: any) => {
        this.logger.debug('Log temps réel →', data);
        callback(data);
      });
    } catch (error) {
      this.logger.error('Erreur lors du démarrage du realtime :', error.message || error);
      throw error;
    }
  }

  /**
   * Capture une empreinte biométrique depuis l'appareil ZKTeco
   * Vérifie d'abord s'il y a un log très récent (-30s)
   * Sinon, attend que l'utilisateur place son doigt
   */
  async captureFingerprint(timeoutMs: number = 30000): Promise<string> {
    await this.ensureConnection();
    this.logger.log(`Démarrage capture empreinte (Polling + RT, timeout: ${timeoutMs}ms)`);

    // 1. Obtenir le dernier état connu (pour détecter un NOUVEAU log)
    let lastLogSn = -1;
    try {
      const logs = await this.getAttendances();
      if (logs.length > 0) {
        const lastLog = logs[logs.length - 1];
        lastLogSn = lastLog.userSn || -1;

        // --- CHECK RECENT LOG (-30s) ---
        const logTime = new Date(lastLog.recordTime);
        const realNow = new Date();

        const deviceNow = new Date(lastLog.recordTime);
        deviceNow.setUTCHours(realNow.getUTCHours());
        deviceNow.setUTCMinutes(realNow.getUTCMinutes());
        deviceNow.setUTCSeconds(realNow.getUTCSeconds());

        const diffSeconds = Math.abs(deviceNow.getTime() - logTime.getTime()) / 1000;
        this.logger.debug(`Dernier pointage: SN ${lastLogSn}, il y a ${diffSeconds.toFixed(1)}s`);

        if (diffSeconds <= 30) {
          this.logger.log(`✅ Pointage très récent trouvé (-30s): User ${lastLog.deviceUserId}`);
          return String(lastLog.deviceUserId || lastLog.uid || lastLog.userId);
        }
      }
    } catch (e) {
      this.logger.warn('Impossible de lire les logs initiaux, on se basera uniquement sur le temps réel.');
    }

    // 2. Attente d'un nouveau log (Polling + Real-time)
    return new Promise((resolve, reject) => {
      let resolved = false;

      const cleanup = () => {
        resolved = true;
        clearInterval(polling);
        clearTimeout(timer);
      };

      // Timeout global
      const timer = setTimeout(() => {
        if (!resolved) {
          cleanup();
          this.logger.warn('Capture expirée (Timeout 30s)');
          reject(new Error('Placez le doigt encore ou réessayez'));
        }
      }, timeoutMs);

      // Polling de secours (toutes les 2 secondes)
      const polling = setInterval(async () => {
        if (resolved) return;
        try {
          const logs = await this.getAttendances();
          if (logs.length > 0) {
            const lastLog = logs[logs.length - 1];
            // Si le numéro de séquence a augmenté, c'est un nouveau log!
            if (lastLog.userSn > lastLogSn && lastLogSn !== -1) {
              this.logger.log(`✅ Nouveau pointage détecté via polling: User ${lastLog.deviceUserId}`);
              const userId = lastLog.deviceUserId || lastLog.uid || lastLog.userId;
              cleanup();
              resolve(String(userId));
            } else if (lastLogSn === -1) {
              // Si on n'avait pas de SN initial, on prend le premier qui arrive
              lastLogSn = lastLog.userSn;
            }
          }
        } catch (e) {
          // Ignorer les erreurs temporaires de polling
        }
      }, 2500);

      // Listener Temps Réel (si supporté par l'appareil)
      try {
        this.zkInstance.getRealTimeLogs((data: any) => {
          if (resolved) return;
          this.logger.log('✅ Pointage détecté via temps réel:', data);
          const userId = data?.deviceUserId || data?.uid || data?.userId || data?.userID;
          if (userId) {
            cleanup();
            resolve(String(userId));
          }
        });
      } catch (e) {
        this.logger.error('Erreur listener temps réel:', e.message);
      }
    });
  }

  /**
   * Nettoyage à l'arrêt de l'app
   */
  async onModuleDestroy() {
    await this.disconnect();
  }
}