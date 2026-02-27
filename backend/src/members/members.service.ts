import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto, Sexe } from './dto/create-member.dto';
import {
  normalizeSectionName,
  getSectionLetter,
} from '../common/constants/sections';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { Prisma, StatutMembre as PrismaStatutMembre, Devise } from '@prisma/client';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);
  constructor(private prisma: PrismaService) {}

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

    const fileName = `${prefix}_${Date.now()}.${extension}`;
    fs.writeFileSync(path.join(this.uploadsDir, fileName), buffer);

    return fileName;
  }

  async findAll(params: { page?: number; pageSize?: number; userId?: string } = {}) {
    const { page = 1, pageSize = 10, userId } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {
      NOT: [
        { numeroCompte: { contains: '0000' } },
        { numeroCompte: 'COOP-REVENUS' },
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

  async findOne(id: number) {
    const membre = await this.prisma.membre.findUnique({
      where: { id },
      include: { delegues: true },
    });
    if (!membre) throw new NotFoundException('Membre non trouvé');
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

  private async ensureSectionAndCollectiveAccount(
    typeCompte: string,
  ) {
    const typeNormalise = normalizeSectionName(typeCompte);
    const sectionLetter = getSectionLetter(typeNormalise);

    // Le compte collectif d'une section est UNIQUE et ne dépend pas de l'année
    // Format : COOP-X-SECTION-0000 (X est la lettre de section)
    const compteCollectif = `COOP-${sectionLetter}-SECTION-0000`;

    // 1. S'assurer que la section existe
    await this.prisma.section.upsert({
      where: { nom: typeNormalise },
      update: {}, // Ne rien changer si elle existe
      create: {
        nom: typeNormalise,
        numeroCompte: compteCollectif,
        solde: 0,
      },
    });

    // 2. S'assurer que le compte membre lié au collectif existe
    await this.prisma.membre.upsert({
      where: { numeroCompte: compteCollectif },
      update: {},
      create: {
        numeroCompte: compteCollectif,
        nomComplet: `Compte Collectif ${typeNormalise}`,
        dateAdhesion: new Date(),
        telephone: '0000000000',
        typeCompte: typeNormalise,
        statut: PrismaStatutMembre.actif,
        motDePasse: 'collectif',
      },
    });

    return compteCollectif;
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
      const sectionLetter = getSectionLetter(typeNormalise);
      finalNumeroCompte = await this.generateNumero(yearAdh, sectionLetter);
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

    // Gérer la section et le compte collectif (créés une seule fois au format -SECTION-0000)
    await this.ensureSectionAndCollectiveAccount(typeNormalise);

    let hashedPassword: string | null = null;
    if (motDePasse) {
      hashedPassword = await bcrypt.hash(motDePasse, 10);
    }

    // Gérer la photo du membre
    const photoFileName = this.saveBase64Image(
      createMemberDto.photoProfil || '',
      'photo',
    );

    return this.prisma.$transaction(async (tx) => {
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
          dateNaissance: createMemberDto.dateNaissance
            ? new Date(createMemberDto.dateNaissance)
            : null,
          idNationale: createMemberDto.idNationale,
        },
      });

      // 1. Ajouter automatiquement les frais de création (2000 FC) au compte collectif
      const sectionLetter = getSectionLetter(typeNormalise);
      const compteCollectif = `COOP-${sectionLetter}-SECTION-0000`;

      await tx.epargne.create({
        data: {
          compte: compteCollectif,
          typeOperation: 'depot',
          devise: 'FC',
          montant: 2000,
          dateOperation: new Date(dateAdhesion),
          description: `Cotisation de création - Membre ${finalNumeroCompte}`,
        },
      });

      // Mettre à jour le solde du compte collectif
      await tx.section.update({
        where: { nom: typeNormalise },
        data: {
          solde: {
            increment: 2000,
          },
        },
      });

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
            userId: delegue.userId,
            photoProfil: deleguePhotoFileName,
          },
        });
      }

      this.logger.log(`✅ Membre créé avec succès : ${membre.numeroCompte} - ${membre.nomComplet}`);
      return membre;
    });
  }

  async generateNumero(year: number, section?: string) {
    const currentYear = year || new Date().getFullYear();
    const sectionLetter = section || 'P';

    // Format recherché : COOP-P-2026-
    const resultPrefix = `COOP-${sectionLetter}-${currentYear}-`;

    // Chercher le dernier membre de cette section ET de cette année
    const members = await this.prisma.membre.findMany({
      where: {
        numeroCompte: { startsWith: resultPrefix },
        // On ignore les comptes collectifs (ex: COOP-P-SECTION-0000)
        NOT: {
          numeroCompte: { contains: 'SECTION' },
        },
      },
      orderBy: { numeroCompte: 'desc' },
      take: 1,
    });

    let nextNumber = 1;

    if (members.length > 0) {
      const lastMembre = members[0];
      const parts = lastMembre.numeroCompte.split('-');
      const lastPart = parts[parts.length - 1];

      if (lastPart && /^\d+$/.test(lastPart)) {
        nextNumber = parseInt(lastPart) + 1;
      }
    }

    return `${resultPrefix}${String(nextNumber).padStart(4, '0')}`;
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
      if (!updateDto.motDePasse.startsWith('$2')) {
        data.motDePasse = await bcrypt.hash(updateDto.motDePasse, 10);
      } else {
        data.motDePasse = updateDto.motDePasse;
      }
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
    const membre = await this.prisma.membre.findUnique({ where: { id } });
    if (!membre) throw new NotFoundException('Membre non trouvé');

    // Supprimer la photo
    if (membre.photoProfil) {
      const photoPath = path.join(this.uploadsDir, membre.photoProfil);
      if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
    }

    return this.prisma.membre.delete({ where: { id } });
  }

  async getStats() {
    const filter = {
      NOT: [
        { numeroCompte: { contains: '0000' } },
        { numeroCompte: 'COOP-REVENUS' },
      ],
    };

    const total = await this.prisma.membre.count({ where: filter });
    const actifs = await this.prisma.membre.count({
      where: { ...filter, statut: PrismaStatutMembre.actif },
    });
    const inactifs = total - actifs;
    const hommes = await this.prisma.membre.count({
      where: { ...filter, sexe: 'M' },
    });
    const femmes = await this.prisma.membre.count({
      where: { ...filter, sexe: 'F' },
    });

    const typeComptes = await this.prisma.membre.groupBy({
      by: ['typeCompte'],
      where: filter,
      _count: { _all: true },
    });

    return { total, actifs, inactifs, hommes, femmes, typeComptes };
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
}
