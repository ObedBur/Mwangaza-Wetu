import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRemboursementDto } from './dto/create-remboursement.dto';
import { Devise, StatutCredit } from '@prisma/client';
import {
  normalizeSectionName,
  getSectionLetter,
  getSectionTrigram,
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

      // 2. Enregistrer le revenu d'intérêt (15% du montant remboursé)
      const interet = Math.round(Number(montant) * 0.15 * 100) / 100;
      const revType = await tx.revenuType.findFirst({
        where: { nom: 'Système Remboursement' },
      });

      if (revType && interet > 0) {
        // 2.1 Enregistrement dans la table Revenu (Nouvelle architecture)
        await tx.revenu.create({
          data: {
            typeCompte: credit.membre.typeCompte,
            typeRevenuId: revType.id,
            montant: interet,
            devise: devise as Devise,
            dateOperation: dateR,
            sourceCompte: credit.numeroCompte,
            referenceId: remboursement.id.toString(),
          },
        });

        // 2.2 Enregistrement sur le compte de REVENUS de la section
        const sectionTrigram = getSectionTrigram(credit.membre.typeCompte);
        const revenueAccount = `MW-${sectionTrigram}-REVENUS`;

        await tx.epargne.create({
          data: {
            compte: revenueAccount,
            typeOperation: 'depot',
            devise: devise as Devise,
            montant: interet,
            dateOperation: dateR,
            description: `Intérêts remboursement crédit ${credit.numeroCompte}`,
          },
        });

        // 2.3 Enregistrement sur le compte REVENUS GLOBAL
        await tx.epargne.create({
          data: {
            compte: 'MW-REVENUS-GLOBAL',
            typeOperation: 'depot',
            devise: devise as Devise,
            montant: interet,
            dateOperation: dateR,
            description: `Intérêts remboursement crédit ${credit.numeroCompte} (via ${credit.membre.typeCompte})`,
          },
        });
      }

      const montantTotalAttendu =
        Number(credit.montant) * (1 + Number(credit.tauxInteret) / 100);

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
