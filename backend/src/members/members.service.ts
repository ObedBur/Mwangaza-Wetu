import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateMemberDto, Sexe } from './dto/create-member.dto';
import {
  normalizeSectionName,
  getSectionLetter,
  getSectionTrigram,
} from '../common/constants/sections';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { Prisma, StatutMembre as PrismaStatutMembre, Devise } from '@prisma/client';
import { MemberFinanceService } from './member-finance.service';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private financeService: MemberFinanceService
  ) { }

  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  private ensureUploadsDir() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  private saveBase64Image(base64: string, prefix: string): string | null {
    if (
      !base64 ||
      typeof base64 !== 'string' ||
      !base64.startsWith('data:image')
    ) {
      return null;
    }

    const matches = base64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return null;
    }

    this.ensureUploadsDir();

    const imageType = matches[1];
    const imageData = matches[2];
    const buffer = Buffer.from(imageData, 'base64');

    let extension = 'jpg';
    if (imageType.includes('png')) extension = 'png';
    else if (imageType.includes('gif')) extension = 'gif';
    else if (imageType.includes('jpeg')) extension = 'jpg';

    const fileName = `${prefix}_${randomUUID()}.${extension}`;
    fs.writeFileSync(path.join(this.uploadsDir, fileName), buffer);

    return fileName;
  }

  async findAll(params: { page?: number; pageSize?: number; userId?: string } = {}) {
    const { page = 1, pageSize = 10, userId } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {
      NOT: [
        { numeroCompte: { contains: 'SECTION-0000' } },
        { numeroCompte: { contains: 'REVENUS' } },
        { numeroCompte: { contains: 'CREDITS' } },
        { numeroCompte: { contains: 'TRESORERIE' } },
      ],
    };

    if (userId) {
      where.userId = userId;
    }

    const [total, data] = await Promise.all([
      this.prisma.membre.count({ where }),
      this.prisma.membre.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { dateAdhesion: 'desc' },
        include: { delegues: true },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: page * pageSize < total,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Trouve un membre par son ID unique ou son identifiant ZKTeco (userId).
   */
  async findOne(idOrZkId: number | string) {
    const isId = typeof idOrZkId === 'number' || !isNaN(Number(idOrZkId));
    const where = isId ? { id: Number(idOrZkId) } : { userId: String(idOrZkId) };

    const membre = await this.prisma.membre.findUnique({
      where: where as any,
      include: { delegues: true },
    });

    if (!membre) {
      if (!isId) {
        // Fallback pour chercher par ZKId si findUnique ne suffit pas (userId n'est pas @unique dans schema)
        return this.findByZkId(String(idOrZkId));
      }
      throw new NotFoundException('Membre non trouvé');
    }
    return membre;
  }

  async findByNumero(numeroCompte: string) {
    const membre = await this.prisma.membre.findUnique({
      where: { numeroCompte },
      include: { delegues: true },
    });
    return membre
      ? { exists: true, membre }
      : { exists: false, message: 'Aucun membre trouvé' };
  }

  /**
   * Trouve un membre à partir d'un ID ZKTeco.
   * On cherche d'abord si l'ID appartient au membre lui-même,
   * sinon on cherche si l'ID appartient à l'un de ses délégués.
   */
  async findByZkId(zkId: string) {
    // 1. Chercher si c'est un membre directement
    let membre = await this.prisma.membre.findFirst({
      where: { userId: zkId },
      include: { delegues: true },
    });

    if (membre) return membre;

    // 2. Sinon, chercher si c'est un délégué
    const delegue = await this.prisma.delegue.findFirst({
      where: { userId: zkId },
      include: {
        membre: {
          include: { delegues: true },
        },
      },
    });

    if (delegue?.membre) {
      return delegue.membre;
    }

    throw new NotFoundException(`Aucun membre ou délégué trouvé avec l'identifiant biométrique ${zkId}`);
  }


  async create(createMemberDto: CreateMemberDto) {
    const {
      numeroCompte,
      motDePasse,
      typeCompte,
      dateAdhesion,
      delegue,
    } = createMemberDto;

    // Normaliser le type de compte pour la cohérence des stats
    const typeNormalise = normalizeSectionName(typeCompte);
    const dateAdh = new Date(dateAdhesion);
    const yearAdh = isNaN(dateAdh.getTime())
      ? new Date().getFullYear()
      : dateAdh.getFullYear();

    // Générer le numéro de compte s'il n'est pas fourni
    let finalNumeroCompte = numeroCompte;
    if (!finalNumeroCompte) {
      const sectionTrigram = getSectionTrigram(typeNormalise);
      finalNumeroCompte = await this.generateNumero(yearAdh, sectionTrigram);
    } else {
      // Vérifier l'unicité seulement s'il est fourni
      const existingNum = await this.prisma.membre.findUnique({
        where: { numeroCompte: finalNumeroCompte },
      });
      if (existingNum)
        throw new BadRequestException('Ce numéro de compte existe déjà');
    }

    // Vérifier l'unicité du userId (empreinte) pour le membre
    if (createMemberDto.userId) {
      const check = await this.checkUserId(createMemberDto.userId);
      if (check.exists) {
        throw new BadRequestException(`Cette empreinte est déjà enregistrée pour un autre ${check.where}`);
      }
    }

    // Vérifier l'unicité du userId (empreinte) pour le délégué
    if (delegue?.userId) {
      const checkDelegue = await this.checkUserId(delegue.userId);
      if (checkDelegue.exists) {
        throw new BadRequestException(`L'empreinte du délégué est déjà enregistrée pour un autre ${checkDelegue.where}`);
      }
    }


    let hashedPassword: string | null = null;
    if (motDePasse) {
      hashedPassword = await bcrypt.hash(motDePasse, 10);
    } else if (createMemberDto.telephone) {
      // Générer le mot de passe par défaut (les 6 derniers chiffres du numéro de téléphone)
      const digitsOnly = createMemberDto.telephone.replace(/\D/g, '');
      if (digitsOnly.length >= 6) {
        const defaultPin = digitsOnly.slice(-6);
        hashedPassword = await bcrypt.hash(defaultPin, 10);
      }
    }

    // Gérer la photo du membre
    const photoFileName = this.saveBase64Image(
      createMemberDto.photoProfil || '',
      'photo',
    );

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const membre = await tx.membre.create({
          data: {
            numeroCompte: finalNumeroCompte,
            nomComplet: createMemberDto.nomComplet,
            telephone: createMemberDto.telephone,
            email: createMemberDto.email,
            adresse: createMemberDto.adresse,
            sexe: createMemberDto.sexe as Sexe,
            typeCompte: typeNormalise, // Utiliser la valeur normalisée
            statut: createMemberDto.statut as PrismaStatutMembre,
            photoProfil: photoFileName,
            userId: createMemberDto.userId || null,
            dateAdhesion: new Date(dateAdhesion),
            motDePasse: hashedPassword,
            firstAcces: true,
            dateNaissance: createMemberDto.dateNaissance
              ? new Date(createMemberDto.dateNaissance)
              : null,
            idNationale: createMemberDto.idNationale,
          },
        });

        // OUVERTURE AUTOMATIQUE DU COMPTE D'ÉPARGNE PERSONNEL
        // Indispensable pour l'intégrité des données financières du membre
        await tx.compteEpargne.create({
          data: {
            numeroCompte: finalNumeroCompte,
            typeCompte: typeNormalise,
            solde: 0,
            statut: 'actif',
          },
        });

        // Enregistrer le revenu d'Adhésion (2000 FC) dans la table Revenu
        const revType = await tx.revenuType.findFirst({
          where: { nom: 'Système Membre' },
        });

        if (revType) {
          // ENREGISTREMENT DU REVENU (Comptabilité de la coopérative)
          // La somme de 2000 FC est enregistrée comme un revenu lié au type de compte.
          // Le solde global des revenus sera calculé à partir de cette table.
          await tx.revenu.create({
            data: {
              typeCompte: typeNormalise,
              typeRevenuId: revType.id,
              montant: 2000,
              devise: Devise.FC,
              dateOperation: new Date(dateAdhesion),
              sourceCompte: finalNumeroCompte,
            },
          });
        }

        // 2. Gérer le délégué
        if (delegue) {
          const deleguePhotoFileName = this.saveBase64Image(
            delegue.photoProfil || '',
            'photo_delegue',
          );
          await tx.delegue.create({
            data: {
              membreId: membre.id,
              nom: delegue.nom,
              telephone: delegue.telephone,
              relation: delegue.relation,
              pieceIdentite: delegue.pieceIdentite,
              userId: delegue.userId || null,
              photoProfil: deleguePhotoFileName,
            },
          });
        }

        return membre;
      });

      this.logger.log(`[SUCCESS] Membre créé : ${result.numeroCompte} - ${result.nomComplet}`);
      
      // Notifier les administrateurs
      await this.notificationsService.notifyAllAdmins(
        'Nouveau Membre',
        `Le membre ${result.nomComplet} (${result.numeroCompte}) vient d'être enregistré.`,
        'info'
      );

      return result;
    } catch (error) {
      this.logger.error(`[ERROR] Échec de création du membre : ${error.message}`);
      throw error;
    }
  }

  async generateNumero(year: number, section?: string) {
    const sectionTrigram = section || 'PRI';

    // Format final sans année avec 6 caractères aléatoires : MW-TRI-RANDOM6
    let finalNumero: string;
    let isUnique = false;

    while (!isUnique) {
      // Générer 6 caractères alphanumériques aléatoires
      const randomPart = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()
        .padEnd(6, '0');

      finalNumero = `MW-${sectionTrigram}-${randomPart}`;

      // Vérifier l'unicité
      const existing = await this.prisma.membre.findUnique({
        where: { numeroCompte: finalNumero },
      });

      if (!existing) {
        isUnique = true;
      }
    }

    return finalNumero!;
  }

  async findDelegueByUserId(userId: string) {
    const delegue = await this.prisma.delegue.findFirst({
      where: { userId },
      include: { membre: true },
    });

    if (!delegue) {
      return { success: false, message: 'Délégué non trouvé' };
    }

    return {
      success: true,
      delegue: {
        id: delegue.id,
        nom: delegue.nom,
        telephone: delegue.telephone,
        relation: delegue.relation,
        userId: delegue.userId,
      },
      membre: {
        numero_compte: delegue.membre.numeroCompte,
        nom_complet: delegue.membre.nomComplet,
        type_compte: delegue.membre.typeCompte,
        statut: delegue.membre.statut,
      },
    };
  }

  async update(id: number, updateDto: Partial<CreateMemberDto>) {
    const membre = await this.prisma.membre.findUnique({
      where: { id },
      include: { delegues: true },
    });
    if (!membre) throw new NotFoundException('Membre non trouvé');

    // Vérifier l'unicité du userId pour le membre si modifié
    if (updateDto.userId && updateDto.userId !== membre.userId) {
      const check = await this.checkUserId(updateDto.userId, id);
      if (check.exists) {
        throw new BadRequestException(`Cette empreinte est déjà enregistrée pour un autre ${check.where}`);
      }
    }

    // Vérifier l'unicité du userId pour le délégué si fourni
    if (updateDto.delegue?.userId) {
      const currentDelegueId = membre.delegues[0]?.userId;
      if (updateDto.delegue.userId !== currentDelegueId) {
        const check = await this.checkUserId(updateDto.delegue.userId, id);
        if (check.exists) {
          throw new BadRequestException(`L'empreinte du délégué est déjà enregistrée pour un autre ${check.where}`);
        }
      }
    }

    const data: Prisma.MembreUpdateInput = {};

    if (updateDto.motDePasse) {
      data.motDePasse = await bcrypt.hash(updateDto.motDePasse, 10);
    }

    if (updateDto.nomComplet) data.nomComplet = updateDto.nomComplet;
    if (updateDto.telephone) data.telephone = updateDto.telephone;
    if (updateDto.email !== undefined) data.email = updateDto.email;
    if (updateDto.adresse !== undefined) data.adresse = updateDto.adresse;
    if (updateDto.sexe) data.sexe = updateDto.sexe;
    if (updateDto.statut) data.statut = updateDto.statut as PrismaStatutMembre;
    if (updateDto.typeCompte) data.typeCompte = updateDto.typeCompte;
    if (updateDto.dateAdhesion)
      data.dateAdhesion = new Date(updateDto.dateAdhesion);
    if (updateDto.dateNaissance !== undefined)
      data.dateNaissance = updateDto.dateNaissance
        ? new Date(updateDto.dateNaissance)
        : null;
    if (updateDto.idNationale !== undefined)
      data.idNationale = updateDto.idNationale;

    // Gérer la photo du membre si fournie en base64
    if (
      updateDto.photoProfil &&
      updateDto.photoProfil.startsWith('data:image')
    ) {
      const photoFileName = this.saveBase64Image(
        updateDto.photoProfil,
        'photo',
      );
      if (photoFileName) {
        data.photoProfil = photoFileName;
        // Supprimer l'ancienne photo
        if (membre.photoProfil) {
          const oldPath = path.join(this.uploadsDir, membre.photoProfil);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }
    } else if (updateDto.photoProfil === null || updateDto.photoProfil === '') {
      data.photoProfil = null;
      if (membre.photoProfil) {
        const oldPath = path.join(this.uploadsDir, membre.photoProfil);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedMembre = await tx.membre.update({
        where: { id },
        data,
      });

      // Gérer le délégué
      if (updateDto.delegue) {
        const existingDelegue = membre.delegues[0];
        const deleguePhotoFileName = this.saveBase64Image(
          updateDto.delegue.photoProfil || '',
          'photo_delegue',
        );

        if (existingDelegue) {
          await tx.delegue.update({
            where: { id: existingDelegue.id },
            data: {
              nom: updateDto.delegue.nom,
              telephone: updateDto.delegue.telephone,
              relation: updateDto.delegue.relation,
              pieceIdentite: updateDto.delegue.pieceIdentite,
              userId: updateDto.delegue.userId,
              photoProfil: deleguePhotoFileName || existingDelegue.photoProfil,
            },
          });
        } else {
          await tx.delegue.create({
            data: {
              membreId: updatedMembre.id,
              nom: updateDto.delegue.nom,
              telephone: updateDto.delegue.telephone,
              relation: updateDto.delegue.relation,
              pieceIdentite: updateDto.delegue.pieceIdentite,
              userId: updateDto.delegue.userId,
              photoProfil: deleguePhotoFileName,
            },
          });
        }
      }

      return updatedMembre;
    });
  }

  async remove(id: number) {
    const membre = await this.prisma.membre.findUnique({
      where: { id },
      include: {
        epargnes: { take: 1 },
        retraits: { take: 1 },
        credits: { take: 1 },
        comptesEpargne: true
      }
    });

    if (!membre) throw new NotFoundException('Membre non trouvé');

    // Empêcher la suppression des comptes système
    if (
      membre.numeroCompte === 'MW-REVENUS-GLOBAL' ||
      membre.numeroCompte.includes('SECTION-0000') ||
      membre.numeroCompte.includes('-REVENUS') ||
      membre.typeCompte === 'SYSTEME'
    ) {
      throw new BadRequestException('Impossible de supprimer un compte système.');
    }

    // Empêcher la suppression si le membre a des transactions
    if (
      membre.epargnes.length > 0 ||
      membre.retraits.length > 0 ||
      membre.credits.length > 0
    ) {
      throw new BadRequestException('Ce membre a des transactions enregistrées. Veuillez le désactiver plutôt que de le supprimer.');
    }

    // Supprimer la photo
    if (membre.photoProfil) {
      const photoPath = path.join(this.uploadsDir, membre.photoProfil);
      if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
    }

    // Supprimer les données liées dans une transaction pour garantir l'intégrité
    return this.prisma.$transaction(async (tx) => {
      // 1. Supprimer les délégués
      await tx.delegue.deleteMany({ where: { membreId: id } });

      // 2. Supprimer les comptes d'épargne (balances) associés
      await tx.compteEpargne.deleteMany({ where: { numeroCompte: membre.numeroCompte } });

      // 3. Supprimer le membre final
      return tx.membre.delete({ where: { id } });
    });
  }

  async getStats() {
    return this.financeService.getStats();
  }

  async checkUserId(userId: string, excludeId?: number) {
    const membre = await this.prisma.membre.findFirst({
      where: {
        userId,
        id: excludeId ? { not: excludeId } : undefined,
      },
    });
    if (membre) return { exists: true, where: 'membre' };

    const delegue = await this.prisma.delegue.findFirst({
      where: {
        userId,
        membreId: excludeId ? { not: excludeId } : undefined,
      },
    });
    if (delegue) return { exists: true, where: 'délégué' };

    return { exists: false, where: null };
  }

  async getMemberDashboard(identifier: string) {
    // Identifier can be an ID (number) or Account Number (string)
    const isId = !isNaN(Number(identifier));
    
    const whereClause = isId 
      ? { id: Number(identifier) }
      : { numeroCompte: identifier };

    const membre = await this.prisma.membre.findUnique({
      where: whereClause,
      include: {
        delegues: true,
        epargnes: {
          orderBy: { dateOperation: 'desc' },
        },
        retraits: {
          orderBy: { dateOperation: 'desc' },
        },
        credits: {
          include: {
            remboursements: {
              orderBy: { dateRemboursement: 'desc' }
            }
          },
          orderBy: { dateDebut: 'desc' },
        }
      }
    });

    if (!membre) throw new NotFoundException('Membre non trouvé');

    if (membre.firstAcces) {
      throw new BadRequestException('Veuillez changer votre mot de passe pour accéder à votre tableau de bord');
    }

    // Déléguer les calculs financiers complexes au MemberFinanceService
    const balances = this.financeService.calculateBalances(membre);
    const monthlyHistory = this.financeService.generateMonthlyHistory(membre);

    // Mettre à plat et trier les transactions récentes interactives
    const allTransactions = [
      ...membre.epargnes
        .filter(e => e.typeOperation === 'depot')
        .map(e => ({ type: 'depot', devise: e.devise, montant: Number(e.montant), date: e.dateOperation, description: e.description })),
      ...membre.retraits
        .map(r => ({ type: 'retrait', devise: r.devise, montant: Number(r.montant), date: r.dateOperation, description: r.description, frais: Number(r.frais) })),
      ...membre.credits.flatMap(c =>
        c.remboursements.map(r => ({ type: 'remboursement', devise: r.devise, montant: Number(r.montant), date: r.dateRemboursement, description: r.description }))
      )
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Format Credits Details pour l'UI
    const activeCreditsDetails = membre.credits
      .filter(c => c.statut === PrismaStatutMembre.actif || c.statut === 'en_retard')
      .map(c => {
        const montantTotal = Number(c.montant) * (1 + Number(c.tauxInteret) / 100);
        const rembourse = Number(c.montantRembourse);
        return {
          id: c.id,
          montantInitial: Number(c.montant),
          montantTotal: montantTotal,
          montantRembourse: rembourse,
          restant: Math.max(0, montantTotal - rembourse),
          tauxInteret: Number(c.tauxInteret),
          devise: c.devise,
          dateDebut: c.dateDebut,
          statut: c.statut,
          progression: montantTotal > 0 ? (rembourse / montantTotal) * 100 : 0
        };
      });

    return {
      profile: {
        id: membre.id,
        numeroCompte: membre.numeroCompte,
        nomComplet: membre.nomComplet,
        typeCompte: membre.typeCompte,
        statut: membre.statut,
        dateAdhesion: membre.dateAdhesion,
        photoProfil: membre.photoProfil
      },
      balances,
      monthlyHistory,
      activeCreditsDetails,
      recentTransactions: allTransactions.slice(0, 15)
    };
  }
}
