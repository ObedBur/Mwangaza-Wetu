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
          getSum(Devise.FC, TypeOperationEpargne.depot) -
          getSum(Devise.FC, TypeOperationEpargne.retrait) -
          getFraisSum(Devise.FC),
        epargne: getSum(Devise.FC, TypeOperationEpargne.depot),
        retrait: getSum(Devise.FC, TypeOperationEpargne.retrait),
        frais: getFraisSum(Devise.FC),
        credit: getCreditSum(Devise.FC).total,
        benefices: beneficesFC._sum.montant || 0,
      },
      usd: {
        solde:
          getSum(Devise.USD, TypeOperationEpargne.depot) -
          getSum(Devise.USD, TypeOperationEpargne.retrait) -
          getFraisSum(Devise.USD),
        epargne: getSum(Devise.USD, TypeOperationEpargne.depot),
        retrait: getSum(Devise.USD, TypeOperationEpargne.retrait),
        frais: getFraisSum(Devise.USD),
        credit: getCreditSum(Devise.USD).total,
        benefices: beneficesUSD._sum.montant || 0,
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
        getSum(Devise.FC, TypeOperationEpargne.depot) -
        getSum(Devise.FC, TypeOperationEpargne.retrait),
      soldeUSD:
        getSum(Devise.USD, TypeOperationEpargne.depot) -
        getSum(Devise.USD, TypeOperationEpargne.retrait),
      epargneFC: getSum(Devise.FC, TypeOperationEpargne.depot),
      epargneUSD: getSum(Devise.USD, TypeOperationEpargne.depot),
      retraitFC: getSum(Devise.FC, TypeOperationEpargne.retrait),
      retraitUSD: getSum(Devise.USD, TypeOperationEpargne.retrait),
      creditFC: getCreditSum(Devise.FC).montant,
      creditUSD: getCreditSum(Devise.USD).montant,
      remboursementFC: getCreditSum(Devise.FC).rembourse,
      remboursementUSD: getCreditSum(Devise.USD).rembourse,
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
        acc[d] = (acc[d] || 0) + (r.frais || 0);
        return acc;
      },
      {} as Record<string, number>,
    );

    return { rows, aggregate };
  }
}
