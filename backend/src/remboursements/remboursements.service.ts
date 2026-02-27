import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRemboursementDto } from './dto/create-remboursement.dto';
import { Devise, StatutCredit } from '@prisma/client';
import {
  normalizeSectionName,
  getSectionLetter,
} from '../common/constants/sections';

@Injectable()
export class RemboursementsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.remboursement.findMany({
      orderBy: { dateRemboursement: 'desc' },
      include: {
        credit: {
          include: {
            membre: true,
          },
        },
      },
    });
  }

  async findByCredit(creditId: number) {
    return this.prisma.remboursement.findMany({
      where: { creditId },
      orderBy: { dateRemboursement: 'desc' },
    });
  }

  async create(dto: CreateRemboursementDto) {
    const { creditId, montant, devise, dateRemboursement, description } = dto;

    const credit = await this.prisma.credit.findUnique({
      where: { id: creditId },
      include: { membre: true },
    });
    if (!credit) throw new NotFoundException('Crédit non trouvé');

    const dateR = new Date(dateRemboursement);

    return this.prisma.$transaction(async (tx) => {
      // 1. Créer le remboursement
      const remboursement = await tx.remboursement.create({
        data: {
          creditId,
          montant,
          devise: devise,
          dateRemboursement: dateR,
          description,
        },
      });

      // 2. Logique d'intérêts (10% système, 5% membre)
      const montantTotalAttendu =
        Number(credit.montant) * (1 + Number(credit.tauxInteret) / 100);
      const proportion = montant / montantTotalAttendu;
      const interetsRembourses =
        proportion * Number(credit.montant) * (Number(credit.tauxInteret) / 100);

      const interetSysteme = interetsRembourses * (10 / 15);
      const interetMembre = interetsRembourses * (5 / 15);

      // 3. Créditer le compte collectif (Principal)
      const typeNormalise = normalizeSectionName(credit.membre.typeCompte);
      const lettre = getSectionLetter(typeNormalise);
      const year = credit.dateDebut.getFullYear();
      const compteCollectif = `COOP-${lettre}-${year}-0000`;

      await tx.epargne.create({
        data: {
          compte: compteCollectif,
          typeOperation: 'depot',
          devise: devise as Devise,
          montant: montant - interetsRembourses,
          dateOperation: dateR,
          description: `Remboursement crédit #${creditId} - Principal`,
        },
      });

      // 4. Créditer le membre (5%)
      if (interetMembre > 0) {
        await tx.epargne.create({
          data: {
            compte: credit.numeroCompte,
            typeOperation: 'depot',
            devise: devise as Devise,
            montant: interetMembre,
            dateOperation: dateR,
            description: `Intérêts crédités sur remboursement #${remboursement.id}`,
          },
        });
      }

      // 5. Créditer COOP-REVENUS (10%)
      await tx.epargne.create({
        data: {
          compte: 'COOP-REVENUS',
          typeOperation: 'depot',
          devise: devise as Devise,
          montant: interetSysteme,
          dateOperation: dateR,
          description: `Revenus d'intérêts sur remboursement #${remboursement.id}`,
        },
      });

      // 6. Mettre à jour le crédit
      const aggregateResult = await tx.remboursement.aggregate({
        where: { creditId },
        _sum: { montant: true },
      });

      const totalRembourse = Number(aggregateResult._sum.montant || 0);
      const nouveauStatut =
        totalRembourse >= montantTotalAttendu
          ? StatutCredit.rembourse
          : StatutCredit.actif;

      await tx.credit.update({
        where: { id: creditId },
        data: {
          montantRembourse: totalRembourse,
          statut: nouveauStatut,
        },
      });

      return {
        ...remboursement,
        montantRembourse: totalRembourse,
        resteAPayer: montantTotalAttendu - totalRembourse,
        statut: nouveauStatut,
      };
    });
  }

  async remove(id: number) {
    const remboursement = await this.prisma.remboursement.findUnique({
      where: { id },
      include: {
        credit: true,
      },
    });
    if (!remboursement) throw new NotFoundException('Remboursement non trouvé');

    const creditId = remboursement.creditId;

    return this.prisma.$transaction(async (tx) => {
      await tx.remboursement.delete({ where: { id } });

      const aggregateResult = await tx.remboursement.aggregate({
        where: { creditId },
        _sum: { montant: true },
      });

      const totalRembourse = Number(aggregateResult._sum.montant || 0);
      const montantTotalAttendu =
        Number(remboursement.credit.montant) *
        (1 + Number(remboursement.credit.tauxInteret) / 100);
      const nouveauStatut =
        totalRembourse >= montantTotalAttendu
          ? StatutCredit.rembourse
          : StatutCredit.actif;

      await tx.credit.update({
        where: { id: creditId },
        data: {
          montantRembourse: totalRembourse,
          statut: nouveauStatut,
        },
      });

      return { success: true };
    });
  }
}
