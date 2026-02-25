import {
  Injectable,
  BadRequestException,
  NotFoundException,
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
import { Prisma, StatutMembre as PrismaStatutMembre } from '@prisma/client';

@Injectable()
export class MembersService {
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

  async findAll(userId?: string) {
    if (userId) {
      return this.prisma.membre.findMany({
        where: { userId },
        include: { delegues: true },
      });
    }
    return this.prisma.membre.findMany({
      orderBy: { dateAdhesion: 'desc' },
      include: { delegues: true },
    });
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

  private async ensureSectionAndCollectiveAccount(
    typeCompte: string,
    dateAdhesion: string,
  ) {
    const typeNormalise = normalizeSectionName(typeCompte);
    const date = new Date(dateAdhesion);
    const year = isNaN(date.getTime())
      ? new Date().getFullYear()
      : date.getFullYear();
    const lettre = getSectionLetter(typeNormalise);
    const compteCollectif = `COOP-${lettre}-${year}-0000`;

    // S'assurer que la section existe
    await this.prisma.section.upsert({
      where: { nom: typeNormalise },
      update: {},
      create: {
        nom: typeNormalise,
        numeroCompte: compteCollectif,
        solde: 0,
      },
    });

    // S'assurer que le compte collectif existe en tant que membre
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
      userId,
      motDePasse,
      typeCompte,
      dateAdhesion,
      delegue,
    } = createMemberDto;

    // Vérifier l'unicité
    const existingNum = await this.prisma.membre.findUnique({
      where: { numeroCompte },
    });
    if (existingNum)
      throw new BadRequestException('Ce numéro de compte existe déjà');

    if (userId) {
      const existingUser = await this.prisma.membre.findFirst({
        where: { userId },
      });
      if (existingUser)
        throw new BadRequestException('Cet userId est déjà utilisé');
    }

    // Gérer la section et le compte collectif
    await this.ensureSectionAndCollectiveAccount(typeCompte, dateAdhesion);

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
          numeroCompte,
          nomComplet: createMemberDto.nomComplet,
          telephone: createMemberDto.telephone,
          email: createMemberDto.email,
          adresse: createMemberDto.adresse,
          sexe: createMemberDto.sexe as Sexe,
          typeCompte: createMemberDto.typeCompte,
          statut: createMemberDto.statut as PrismaStatutMembre,
          photoProfil: photoFileName,
          userId: createMemberDto.userId,
          dateAdhesion: new Date(dateAdhesion),
          motDePasse: hashedPassword,
          dateNaissance: createMemberDto.dateNaissance
            ? new Date(createMemberDto.dateNaissance)
            : null,
          idNationale: createMemberDto.idNationale,
        },
      });

      // Gérer le délégué
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

      return membre;
    });
  }

  async generateNumero(year: number, section?: string) {
    const currentYear = year || new Date().getFullYear();
    const prefix = section
      ? `COOP-${section}-${currentYear}-`
      : `COOP-${currentYear}-`;

    const lastMembre = await this.prisma.membre.findFirst({
      where: { numeroCompte: { startsWith: prefix } },
      orderBy: { numeroCompte: 'desc' },
    });

    let nextNumber = 1;
    if (lastMembre) {
      const parts = lastMembre.numeroCompte.split('-');
      const lastPart = parts[parts.length - 1];
      if (lastPart && /^\d+$/.test(lastPart)) {
        nextNumber = parseInt(lastPart) + 1;
      }
    }

    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
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
    if (updateDto.userId !== undefined) data.userId = updateDto.userId;
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
    const total = await this.prisma.membre.count();
    const actifs = await this.prisma.membre.count({
      where: { statut: PrismaStatutMembre.actif },
    });
    const inactifs = total - actifs;
    const hommes = await this.prisma.membre.count({ where: { sexe: 'M' } });
    const femmes = await this.prisma.membre.count({ where: { sexe: 'F' } });

    const typeComptes = await this.prisma.membre.groupBy({
      by: ['typeCompte'],
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
