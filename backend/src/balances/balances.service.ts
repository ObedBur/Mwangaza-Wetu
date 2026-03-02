import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Devise, TypeOperationEpargne } from '@prisma/client';

@Injectable()
export class BalancesService {
    /**
     * Recalcule et retourne la garantie gelée pour un membre (tous crédits actifs)
     */
    async rafraichirGarantie(membreId: number, tauxGarantie = 0.3) {
      // Récupérer le numéro de compte du membre
      const membre = await this.prisma.membre.findUnique({
        where: { id: membreId },
        select: { numeroCompte: true },
      });
      if (!membre) throw new Error('Membre non trouvé');

      // Récupérer tous les crédits actifs du membre
      const creditsActifs = await this.prisma.credit.findMany({
        where: { numeroCompte: membre.numeroCompte, statut: 'actif' },
        select: { montant: true, montantRembourse: true, devise: true },
      });

      // Calculer la garantie gelée (somme des encours × tauxGarantie)
      const garantieFC = creditsActifs
        .filter((c) => c.devise === 'FC')
        .reduce((sum, c) => sum + (Number(c.montant) - Number(c.montantRembourse)) * tauxGarantie, 0);

      const garantieUSD = creditsActifs
        .filter((c) => c.devise === 'USD')
        .reduce((sum, c) => sum + (Number(c.montant) - Number(c.montantRembourse)) * tauxGarantie, 0);

      return {
        fc: Math.round(garantieFC * 100) / 100,
        usd: Math.round(garantieUSD * 100) / 100,
      };
    }
  constructor(private prisma: PrismaService) { }

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
        compte: 'MW-REVENUS-GLOBAL',
        devise: Devise.FC,
        typeOperation: TypeOperationEpargne.depot,
      },
      _sum: { montant: true },
    });

    const beneficesUSD = await this.prisma.epargne.aggregate({
      where: {
        compte: 'MW-REVENUS-GLOBAL',
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

  // ────────────────────────────────────────────────────────────────────
  // TRÉSORERIE DISPONIBLE POUR PRÊTS
  // Formule : (Total Épargnes - Total Retraits - Frais) - 20% réserve - Crédits actifs non remboursés
  // ────────────────────────────────────────────────────────────────────
  async getTresorerieDisponible() {
    const TAUX_RESERVE = 0.20; // 20% de réserve obligatoire

    const totals = await this.getTotal();

    // Crédits actifs non remboursés (montant - montantRembourse)
    const creditsActifs = await this.prisma.credit.findMany({
      where: { statut: 'actif' },
      select: { montant: true, montantRembourse: true, devise: true },
    });

    const encoursCreditFC = creditsActifs
      .filter((c) => c.devise === 'FC')
      .reduce((sum, c) => sum + (Number(c.montant) - Number(c.montantRembourse)), 0);

    const encoursCreditUSD = creditsActifs
      .filter((c) => c.devise === 'USD')
      .reduce((sum, c) => sum + (Number(c.montant) - Number(c.montantRembourse)), 0);

    // Caisse réelle = solde des épargnes (dépôts - retraits - frais)
    const caisseFC = totals.fc.solde;
    const caisseUSD = totals.usd.solde;

    // Réserve obligatoire de 20%
    const reserveFC = caisseFC * TAUX_RESERVE;
    const reserveUSD = caisseUSD * TAUX_RESERVE;

    // Trésorerie disponible = Caisse - Réserve - Encours crédits
    const disponibleFC = caisseFC - reserveFC - encoursCreditFC;
    const disponibleUSD = caisseUSD - reserveUSD - encoursCreditUSD;

    return {
      fc: {
        caisse: caisseFC,
        reserve: Math.round(reserveFC * 100) / 100,
        encoursCredits: encoursCreditFC,
        disponible: Math.round(Math.max(0, disponibleFC) * 100) / 100,
      },
      usd: {
        caisse: caisseUSD,
        reserve: Math.round(reserveUSD * 100) / 100,
        encoursCredits: encoursCreditUSD,
        disponible: Math.round(Math.max(0, disponibleUSD) * 100) / 100,
      },
    };
  }

  // ────────────────────────────────────────────────────────────────────
  // SOLDE DISPONIBLE D'UN MEMBRE (avec nantissement/garantie)
  // Si le membre a un crédit actif, une partie de son épargne est gelée
  // en guise de garantie (= montant du crédit non encore remboursé * tauxGarantie)
  // ────────────────────────────────────────────────────────────────────
  async getSoldeDisponibleMembre(numeroCompte: string, tauxGarantie = 0.30) {
    // 1. Calculer le solde brut d'épargne du membre
    const epargneStats = await this.prisma.epargne.groupBy({
      by: ['typeOperation', 'devise'],
      where: { compte: numeroCompte },
      _sum: { montant: true },
    });

    const getEpargneSum = (devise: Devise, type: TypeOperationEpargne) => {
      const item = epargneStats.find(
        (s) => s.devise === devise && s.typeOperation === type,
      );
      return Number(item?._sum?.montant || 0);
    };

    const fraisStats = await this.prisma.retrait.groupBy({
      by: ['devise'],
      where: { compte: numeroCompte },
      _sum: { frais: true },
    });

    const getFrais = (devise: Devise) => {
      const item = fraisStats.find((s) => s.devise === devise);
      return Number(item?._sum?.frais || 0);
    };

    const soldeBrutFC =
      getEpargneSum(Devise.FC, TypeOperationEpargne.depot) -
      getEpargneSum(Devise.FC, TypeOperationEpargne.retrait) -
      getFrais(Devise.FC);

    const soldeBrutUSD =
      getEpargneSum(Devise.USD, TypeOperationEpargne.depot) -
      getEpargneSum(Devise.USD, TypeOperationEpargne.retrait) -
      getFrais(Devise.USD);

    // 2. Calculer la garantie gelée (encours crédits actifs * tauxGarantie)
    const creditsActifs = await this.prisma.credit.findMany({
      where: { numeroCompte, statut: 'actif' },
      select: { montant: true, montantRembourse: true, devise: true },
    });

    const garantieFC = creditsActifs
      .filter((c) => c.devise === 'FC')
      .reduce(
        (sum, c) =>
          sum + (Number(c.montant) - Number(c.montantRembourse)) * tauxGarantie,
        0,
      );

    const garantieUSD = creditsActifs
      .filter((c) => c.devise === 'USD')
      .reduce(
        (sum, c) =>
          sum + (Number(c.montant) - Number(c.montantRembourse)) * tauxGarantie,
        0,
      );

    return {
      fc: {
        soldeBrut: Math.round(soldeBrutFC * 100) / 100,
        garantieGelee: Math.round(garantieFC * 100) / 100,
        soldeDisponible: Math.round(Math.max(0, soldeBrutFC - garantieFC) * 100) / 100,
      },
      usd: {
        soldeBrut: Math.round(soldeBrutUSD * 100) / 100,
        garantieGelee: Math.round(garantieUSD * 100) / 100,
        soldeDisponible: Math.round(Math.max(0, soldeBrutUSD - garantieUSD) * 100) / 100,
      },
    };
  }
}
