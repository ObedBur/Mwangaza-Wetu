import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as ZKLib from 'node-zklib';

@Injectable()
export class ZktecoService implements OnModuleDestroy {
  private readonly logger = new Logger(ZktecoService.name);
  private zkInstance: any;
  private isConnected = false;

  // Configuration de votre appareil
  private readonly ip = '192.168.1.254';
  private readonly port = 4370;
  private readonly timeout = 10000;      // timeout de connexion (ms)
  private readonly inport = 4000;        // port pour les données en temps réel

  /**
   * Se connecte à l'appareil ZKTeco
   */
  async connect(): Promise<boolean> {
    try {
      this.zkInstance = new ZKLib(this.ip, this.port, this.timeout, this.inport);
      await this.zkInstance.createSocket();
      this.isConnected = true;
      this.logger.log('Connecté à l\'appareil ZKTeco');

      // Récupération d'informations générales (optionnel)
      const info = await this.zkInstance.getInfo();
      this.logger.debug('Informations appareil:', info);

      return true;
    } catch (error) {
      this.logger.error('Erreur de connexion:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Déconnecte l'appareil proprement
   */
  async disconnect(): Promise<void> {
    if (this.zkInstance && this.isConnected) {
      try {
        await this.zkInstance.disconnect();
        this.isConnected = false;
        this.logger.log('Déconnecté de l\'appareil');
      } catch (error) {
        this.logger.error('Erreur lors de la déconnexion:', error);
      }
    }
  }

  /**
   * Garantit que la connexion est active avant d'exécuter une commande
   */
  private async ensureConnection(): Promise<void> {
    if (!this.isConnected || !this.zkInstance) {
      await this.connect();
    }
  }

  /**
   * Récupère tous les utilisateurs enregistrés dans l'appareil
   */
  async getUsers(): Promise<any[]> {
    await this.ensureConnection();
    try {
      const users = await this.zkInstance.getUsers();
      return users;
    } catch (error) {
      this.logger.error('Erreur getUsers:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les logs de pointage (attendances)
   */
  async getAttendances(): Promise<any[]> {
    await this.ensureConnection();
    try {
      // Attention : getAttendances() peut retourner une énorme quantité de données
      const attendances = await this.zkInstance.getAttendances();
      return attendances;
    } catch (error) {
      this.logger.error('Erreur getAttendances:', error);
      throw error;
    }
  }

  /**
   * Efface tous les logs de pointage de l'appareil (à utiliser avec précaution)
   */
  async clearAttendanceLog(): Promise<void> {
    await this.ensureConnection();
    try {
      await this.zkInstance.clearAttendanceLog();
      this.logger.log('Logs de présence effacés');
    } catch (error) {
      this.logger.error('Erreur clearAttendanceLog:', error);
      throw error;
    }
  }

  /**
   * Écoute les logs en temps réel. Le callback sera appelé à chaque nouveau log.
   */
  async getRealTimeLogs(callback: (log: any) => void): Promise<void> {
    await this.ensureConnection();
    try {
      // La fonction getRealTimeLogs émet les événements et appelle le callback fourni
      await this.zkInstance.getRealTimeLogs((logData: any) => {
        this.logger.debug('Log temps réel reçu:', logData);
        callback(logData);
      });
    } catch (error) {
      this.logger.error('Erreur getRealTimeLogs:', error);
      throw error;
    }
  }

  /**
   * Implémentation de OnModuleDestroy pour déconnecter proprement à l'arrêt de l'application
   */
  async onModuleDestroy() {
    await this.disconnect();
  }
}
