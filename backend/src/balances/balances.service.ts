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
    const excludeSystem = [
      { compte: { contains: 'REVENUS' } },
      { compte: { contains: 'SECTION-0000' } },
      { compte: { contains: 'CREDITS' } },
      { compte: { contains: 'TRESORERIE' } },
    ];

    const epargneStats = await this.prisma.epargne.groupBy({
      by: ['devise', 'typeOperation'],
      where: {
        NOT: excludeSystem,
      },
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
      where: {
        NOT: excludeSystem,
      },
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
        remboursement: Number(getCreditSum(Devise.FC).rembourse),
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
        remboursement: Number(getCreditSum(Devise.USD).rembourse),
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
    if (comptes.length === 0) {
      return {
        soldeFC: 0,
        soldeUSD: 0,
        epargneFC: 0,
        epargneUSD: 0,
        retraitFC: 0,
        retraitUSD: 0,
        creditFC: 0,
        creditUSD: 0,
        remboursementFC: 0,
        remboursementUSD: 0,
      };
    }

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

  async getDashboardOverview() {
    const total = await this.getTotal();
    const tresorerie = await this.getTresorerieDisponible();

    // Récupérer les soldes par type de membre
    const types = ['PRIVILEGE', 'ORDINAIRE', 'DELERE', 'ENTREPRISE'];
    const byType = await Promise.all(
      types.map(async (t) => ({
        type: t,
        ...(await this.getByType(t)),
      })),
    );

    // Evolution mensuelle (6 derniers mois)
    const history = await this.getMonthlyHistory();
    // Evolution quotidienne (90 derniers jours) pour le graphique interactif
    const dailyHistory = await this.getDailyHistory();

    return {
      overview: {
        totalCaisse: { usd: total.usd.solde, fc: total.fc.solde },
        totalEpargne: { usd: total.usd.epargne, fc: total.fc.epargne },
        totalRetrait: { usd: total.usd.retrait, fc: total.fc.retrait },
        totalFrais: { usd: total.usd.frais, fc: total.fc.frais },
        totalRevenus: { usd: total.usd.benefices, fc: total.fc.benefices },
        totalCredits: { usd: total.usd.credit, fc: total.fc.credit },
        totalRemboursements: { usd: total.usd.remboursement, fc: total.fc.remboursement },
        activeMembersCount: await this.prisma.membre.count({ where: { statut: 'actif' } }),
        activeCreditsCount: await this.prisma.credit.count({ where: { statut: 'actif' } }),
        totalMembers: await this.prisma.membre.count(),
        totalAccounts: await this.prisma.compteEpargne.count(),
      },
      tresorerie,
      byType,
      history,
      dailyHistory,
    };
  }

  async getMonthlyHistory() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const epargnes = await this.prisma.epargne.findMany({
      where: { dateOperation: { gte: sixMonthsAgo } },
      select: {
        dateOperation: true,
        montant: true,
        typeOperation: true,
        devise: true,
      },
    });

    const months = [...new Array(6)]
      .map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return d.toISOString().substring(0, 7); // YYYY-MM
      })
      .reverse();

    return months.map((month) => {
      const filtered = epargnes.filter((e) =>
        e.dateOperation.toISOString().startsWith(month),
      );
      return {
        month,
        depotsUSD: filtered
          .filter((e) => e.devise === 'USD' && e.typeOperation === 'depot')
          .reduce((sum, e) => sum + Number(e.montant), 0),
        retraitsUSD: filtered
          .filter((e) => e.devise === 'USD' && e.typeOperation === 'retrait')
          .reduce((sum, e) => sum + Number(e.montant), 0),
        depotsFC: filtered
          .filter((e) => e.devise === 'FC' && e.typeOperation === 'depot')
          .reduce((sum, e) => sum + Number(e.montant), 0),
        retraitsFC: filtered
          .filter((e) => e.devise === 'FC' && e.typeOperation === 'retrait')
          .reduce((sum, e) => sum + Number(e.montant), 0),
      };
    });
  }

  async getDailyHistory() {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const [epargnes, credits, remboursements] = await Promise.all([
      this.prisma.epargne.findMany({
        where: { dateOperation: { gte: ninetyDaysAgo } },
        select: { dateOperation: true, montant: true, typeOperation: true, devise: true }
      }),
      this.prisma.credit.findMany({
        where: { dateDebut: { gte: ninetyDaysAgo } },
        select: { dateDebut: true, montant: true, devise: true }
      }),
      this.prisma.remboursement.findMany({
        where: { dateRemboursement: { gte: ninetyDaysAgo } },
        select: { dateRemboursement: true, montant: true, credit: { select: { devise: true } } }
      })
    ]);

    const data: any[] = [];
    const now = new Date();
    for (let i = 90; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const dayEpargnes = epargnes.filter(e => e.dateOperation.toISOString().startsWith(dateStr));
      const dayCredits = credits.filter(c => c.dateDebut.toISOString().startsWith(dateStr));
      const dayRemboursements = remboursements.filter(r => r.dateRemboursement.toISOString().startsWith(dateStr));

      data.push({
        date: dateStr,
        epargne: dayEpargnes.filter(e => e.typeOperation === 'depot' && e.devise === 'USD').reduce((sum, e) => sum + Number(e.montant), 0),
        retrait: dayEpargnes.filter(e => e.typeOperation === 'retrait' && e.devise === 'USD').reduce((sum, e) => sum + Number(e.montant), 0),
        credit: dayCredits.filter(c => c.devise === 'USD').reduce((sum, c) => sum + Number(c.montant), 0),
        remboursement: dayRemboursements.filter(r => r.credit.devise === 'USD').reduce((sum, r) => sum + Number(r.montant), 0),
      });
    }
    return data;
  }

  async findAll(query: { page?: number; pageSize?: number; search?: string }) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (query.search) {
      where.OR = [
        { numeroCompte: { contains: query.search, mode: 'insensitive' } },
        { membre: { nomComplet: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [total, comptes] = await Promise.all([
      this.prisma.compteEpargne.count({ where }),
      this.prisma.compteEpargne.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          membre: true,
        },
        orderBy: { numeroCompte: 'asc' },
      }),
    ]);

    const data = comptes.map((c) => {
      const initials = c.membre?.nomComplet
        ? c.membre.nomComplet.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
        : '??';

      return {
        id: c.id.toString(),
        memberId: c.numeroCompte,
        memberName: c.membre?.nomComplet || 'Inconnu',
        initials,
        accountType: c.typeCompte.toLowerCase(),
        currency: 'USD', // Par défaut
        balanceUSD: Number(c.solde),
        balanceFC: 0,
        totalDeposits: Number(c.solde),
        totalWithdrawals: 0,
        status: c.statut === 'actif' ? 'active' : 'closed',
        lastTransaction: c.updatedAt,
        openedDate: c.dateOuverture || c.createdAt,
      };
    });

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
}
