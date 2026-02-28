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
