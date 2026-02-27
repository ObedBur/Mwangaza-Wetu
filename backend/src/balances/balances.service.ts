import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Devise, TypeOperationEpargne } from '@prisma/client';

@Injectable()
export class BalancesService {
  constructor(private prisma: PrismaService) {}

  async getTotal() {
    const epargneStats = await this.prisma.epargne.groupBy({
      by: ['devise', 'typeOperation'],
      _sum: { montant: true },
    });

    const getSum = (devise: Devise, type: TypeOperationEpargne) => {
      const item = epargneStats.find(
        (s) => s.devise === devise && s.typeOperation === type,
      );
      return item ? item._sum.montant || 0 : 0;
    };

    const creditStats = await this.prisma.credit.groupBy({
      by: ['devise'],
      _sum: { montant: true, montantRembourse: true },
    });

    const getCreditSum = (devise: Devise) => {
      const item = creditStats.find((s) => s.devise === devise);
      return {
        total: item ? item._sum.montant || 0 : 0,
        rembourse: item ? item._sum.montantRembourse || 0 : 0,
      };
    };

    const fraisStats = await this.prisma.retrait.groupBy({
      by: ['devise'],
      _sum: { frais: true },
    });

    const getFraisSum = (devise: Devise) => {
      const item = fraisStats.find((s) => s.devise === devise);
      return item ? item._sum.frais || 0 : 0;
    };

    const beneficesFC = await this.prisma.epargne.aggregate({
      where: {
        compte: 'COOP-REVENUS',
        devise: Devise.FC,
        typeOperation: TypeOperationEpargne.depot,
      },
      _sum: { montant: true },
    });

    const beneficesUSD = await this.prisma.epargne.aggregate({
      where: {
        compte: 'COOP-REVENUS',
        devise: Devise.USD,
        typeOperation: TypeOperationEpargne.depot,
      },
      _sum: { montant: true },
    });

    return {
      fc: {
        solde:
          Number(getSum(Devise.FC, TypeOperationEpargne.depot)) -
          Number(getSum(Devise.FC, TypeOperationEpargne.retrait)) -
          Number(getFraisSum(Devise.FC)),
        epargne: Number(getSum(Devise.FC, TypeOperationEpargne.depot)),
        retrait: Number(getSum(Devise.FC, TypeOperationEpargne.retrait)),
        frais: Number(getFraisSum(Devise.FC)),
        credit: Number(getCreditSum(Devise.FC).total),
        benefices: Number(beneficesFC._sum.montant || 0),
      },
      usd: {
        solde:
          Number(getSum(Devise.USD, TypeOperationEpargne.depot)) -
          Number(getSum(Devise.USD, TypeOperationEpargne.retrait)) -
          Number(getFraisSum(Devise.USD)),
        epargne: Number(getSum(Devise.USD, TypeOperationEpargne.depot)),
        retrait: Number(getSum(Devise.USD, TypeOperationEpargne.retrait)),
        frais: Number(getFraisSum(Devise.USD)),
        credit: Number(getCreditSum(Devise.USD).total),
        benefices: Number(beneficesUSD._sum.montant || 0),
      },
    };
  }

  async getByType(typeCompte: string) {
    const typeNormalise = typeCompte.toUpperCase();
    const membres = await this.prisma.membre.findMany({
      where: { typeCompte: typeNormalise },
      select: { numeroCompte: true },
    });

    const comptes = membres.map((m) => m.numeroCompte);
    if (comptes.length === 0) return { soldeFC: 0, soldeUSD: 0 };

    const epargneStats = await this.prisma.epargne.groupBy({
      by: ['devise', 'typeOperation'],
      where: { compte: { in: comptes } },
      _sum: { montant: true },
    });

    const getSum = (devise: Devise, type: TypeOperationEpargne) => {
      const item = epargneStats.find(
        (s) => s.devise === devise && s.typeOperation === type,
      );
      return item ? item._sum.montant || 0 : 0;
    };

    const creditStats = await this.prisma.credit.groupBy({
      by: ['devise'],
      where: { numeroCompte: { in: comptes } },
      _sum: { montant: true, montantRembourse: true },
    });

    const getCreditSum = (devise: Devise) => {
      const item = creditStats.find((s) => s.devise === devise);
      return {
        montant: item ? item._sum.montant || 0 : 0,
        rembourse: item ? item._sum.montantRembourse || 0 : 0,
      };
    };

    return {
      soldeFC:
        Number(getSum(Devise.FC, TypeOperationEpargne.depot)) -
        Number(getSum(Devise.FC, TypeOperationEpargne.retrait)),
      soldeUSD:
        Number(getSum(Devise.USD, TypeOperationEpargne.depot)) -
        Number(getSum(Devise.USD, TypeOperationEpargne.retrait)),
      epargneFC: Number(getSum(Devise.FC, TypeOperationEpargne.depot)),
      epargneUSD: Number(getSum(Devise.USD, TypeOperationEpargne.depot)),
      retraitFC: Number(getSum(Devise.FC, TypeOperationEpargne.retrait)),
      retraitUSD: Number(getSum(Devise.USD, TypeOperationEpargne.retrait)),
      creditFC: Number(getCreditSum(Devise.FC).montant),
      creditUSD: Number(getCreditSum(Devise.USD).montant),
      remboursementFC: Number(getCreditSum(Devise.FC).rembourse),
      remboursementUSD: Number(getCreditSum(Devise.USD).rembourse),
    };
  }

  async getFraisRetraits() {
    const rows = await this.prisma.retrait.findMany({
      where: { frais: { gt: 0 } },
      orderBy: { dateOperation: 'desc' },
    });

    const aggregate = rows.reduce(
      (acc, r) => {
        const d = r.devise.toUpperCase();
        acc[d] = (acc[d] || 0) + Number(r.frais || 0);
        return acc;
      },
      {} as Record<string, number>,
    );

    return { rows, aggregate };
  }
}
