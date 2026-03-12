import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Devise, StatutMembre as PrismaStatutMembre } from '@prisma/client';

@Injectable()
export class MemberFinanceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calcule les statistiques globales des membres avec des agrégations optimisées.
   */
  async getStats() {
    const filter = {
      NOT: [
        { numeroCompte: { contains: 'SECTION-0000' } },
        { numeroCompte: { contains: 'REVENUS' } },
        { numeroCompte: { contains: 'CREDITS' } },
        { numeroCompte: { contains: 'TRESORERIE' } },
      ],
    };

    const [total, statsComptes, statsSexe, typeComptes] = await Promise.all([
      this.prisma.membre.count({ where: filter }),
      
      this.prisma.membre.groupBy({
        by: ['statut'],
        where: filter,
        _count: { _all: true },
      }),

      this.prisma.membre.groupBy({
        by: ['sexe'],
        where: filter,
        _count: { _all: true },
      }),

      this.prisma.membre.groupBy({
        by: ['typeCompte'],
        where: filter,
        _count: { _all: true },
      }),
    ]);

    const actifs = statsComptes.find(s => s.statut === 'actif')?._count._all || 0;
    const inactifs = statsComptes.find(s => s.statut === 'inactif')?._count._all || 0;
    const hommes = statsSexe.find(s => s.sexe === 'M')?._count._all || 0;
    const femmes = statsSexe.find(s => s.sexe === 'F')?._count._all || 0;

    return { total, actifs, inactifs, hommes, femmes, typeComptes };
  }

  /**
   * Calcule les balances (épargne et crédits) pour un membre spécifique.
   * Optimisé pour HDD/4GB : Utilise une seule passe sur les données déjà en mémoire.
   */
  calculateBalances(membre: any) {
    let epargneUSD = 0;
    let epargneFC = 0;
    let cumulativeUSD = 0;
    let cumulativeFC = 0;

    // 1. Traitement unique des mouvements d'épargne (Dépôts [+] et Retraits [-])
    // On ne filtre plus uniquement par 'depot', on traite les deux.
    if (membre.epargnes) {
      for (const e of membre.epargnes) {
        const montant = Number(e.montant || 0);
        const estDepot = e.typeOperation === 'depot';

        if (e.devise === Devise.USD) {
          if (estDepot) {
            epargneUSD += montant;
            cumulativeUSD += montant;
          } else {
            epargneUSD -= montant;
          }
        } else if (e.devise === Devise.FC) {
          if (estDepot) {
            epargneFC += montant;
            cumulativeFC += montant;
          } else {
            epargneFC -= montant;
          }
        }
      }
    }

    // 2. Déduction des frais de retrait (issus de la table Retraits)
    // Seuls les FRAIS sont déduits ici car le PRINCIPAL est déjà déduit via Epargne(retrait).
    if (membre.retraits) {
      for (const r of membre.retraits) {
        const frais = Number(r.frais || 0);
        if (r.devise === Devise.USD) epargneUSD -= frais;
        else if (r.devise === Devise.FC) epargneFC -= frais;
      }
    }

    // 3. Calcul des crédits actifs
    const activeCredits = (membre.credits || []).filter(c => 
      c.statut === 'actif' || c.statut === 'en_retard'
    );

    const unpaidCreditsUSD = activeCredits
      .filter(c => c.devise === Devise.USD)
      .reduce((sum, c) => sum + (Number(c.montant || 0) * (1 + Number(c.tauxInteret || 0) / 100) - Number(c.montantRembourse || 0)), 0);

    const unpaidCreditsFC = activeCredits
      .filter(c => c.devise === Devise.FC)
      .reduce((sum, c) => sum + (Number(c.montant || 0) * (1 + Number(c.tauxInteret || 0) / 100) - Number(c.montantRembourse || 0)), 0);

    return {
      savings: { USD: epargneUSD, FC: epargneFC },
      activeCredits: { USD: unpaidCreditsUSD, FC: unpaidCreditsFC },
      cumulative: { USD: cumulativeUSD, FC: cumulativeFC }
    };
  }

  /**
   * Génère l'historique mensuel sur les 6 derniers mois.
   */
  generateMonthlyHistory(membre: any) {
    const months: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth();
      const label = d.toLocaleDateString('fr-FR', { month: 'short' });

      const monthEpargne = (membre.epargnes || [])
        .filter(e => {
          const ed = new Date(e.dateOperation);
          return ed.getFullYear() === year && ed.getMonth() === month && e.typeOperation === 'depot';
        })
        .reduce((sum, e) => sum + Number(e.montant || 0) * (e.devise === 'FC' ? 0.0004 : 1), 0);

      // Calcul des retraits du mois (Sorties d'argent)
      // On combine le principal (epargnes type retrait) et les retraits documentés (retraits table)
      const monthRetraitEpargne = (membre.epargnes || [])
        .filter(e => {
          const ed = new Date(e.dateOperation);
          return ed.getFullYear() === year && ed.getMonth() === month && e.typeOperation === 'retrait';
        })
        .reduce((sum, e) => sum + Number(e.montant || 0) * (e.devise === 'FC' ? 0.0004 : 1), 0);

      const monthRetraitTable = (membre.retraits || [])
        .filter(r => {
          const rd = new Date(r.dateOperation);
          return rd.getFullYear() === year && rd.getMonth() === month;
        })
        // On ne prend que les frais ici pour éviter les doublons si le principal est déjà dans epargnes
        // Mais si le retrait n'existe QUE dans la table retraits, on prendrait tout. 
        // Par sécurité, on suit la logique de calculateBalances : Epargnes(retrait) + Retraits(frais)
        .reduce((sum, r) => sum + Number(r.frais || 0) * (r.devise === 'FC' ? 0.0004 : 1), 0);

      const monthRetrait = monthRetraitEpargne + monthRetraitTable;

      const monthCredit = (membre.credits || [])
        .filter(c => {
          const cd = new Date(c.dateDebut);
          return cd.getFullYear() === year && cd.getMonth() === month;
        })
        .reduce((sum, c) => sum + Number(c.montant || 0) * (c.devise === 'FC' ? 0.0004 : 1), 0);

      const monthRemboursement = (membre.credits || []).flatMap(c => c.remboursements || [])
        .filter(r => {
          const rd = new Date(r.dateRemboursement);
          return rd.getFullYear() === year && rd.getMonth() === month;
        })
        .reduce((sum, r) => sum + Number(r.montant || 0) * (r.devise === 'FC' ? 0.0004 : 1), 0);

      months.push({
        name: label,
        epargne: monthEpargne,
        retrait: monthRetrait,
        credit: monthCredit,
        remboursement: monthRemboursement
      });
    }
    return months;
  }
}
