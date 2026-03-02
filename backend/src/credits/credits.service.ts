import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BalancesService } from '../balances/balances.service';
import { CreateCreditDto, StatutCredit } from './dto/create-credit.dto';
import { Devise } from '@prisma/client';
import { getSectionTrigram } from '../common/constants/sections';

@Injectable()
export class CreditsService {
  private readonly logger = new Logger(CreditsService.name);

  constructor(
    private prisma: PrismaService,
    private balancesService: BalancesService,
  ) { }

  async findAll() {
    return this.prisma.credit.findMany({
      orderBy: { createdAt: 'desc' },
      include: { remboursements: true, membre: true },
    });
  }

  async findOne(id: number) {
    const credit = await this.prisma.credit.findUnique({
      where: { id },
      include: { remboursements: true, membre: true },
    });
    if (!credit) throw new NotFoundException('Crédit non trouvé');
    return credit;
  }

  async findByMembre(numeroCompte: string) {
    return this.prisma.credit.findMany({
      where: { numeroCompte },
      include: { remboursements: true },
    });
  }

  async getSoldes() {
    const results = await this.prisma.credit.groupBy({
      by: ['devise'],
      _sum: {
        montant: true,
      },
    });

    const soldeUSD = results.find((r) => r.devise === 'USD')?._sum.montant || 0;
    const soldeFC = results.find((r) => r.devise === 'FC')?._sum.montant || 0;

    return { soldeUSD, soldeFC };
  }

  // ────────────────────────────────────────────────────────────────────
  // CRÉATION DE CRÉDIT AVEC VALIDATION DE TRÉSORERIE + DOUBLE ÉCRITURE
  // ────────────────────────────────────────────────────────────────────
  async create(createDto: CreateCreditDto) {
    const { numeroCompte, montant, duree, dateDebut, devise } = createDto;
    const tauxInteret = createDto.tauxInteret ?? 15;

    this.logger.log(`📋 Demande de crédit: ${montant} ${devise} pour ${numeroCompte}`);

    // ── 1. Vérifier que le membre existe ──────────────────────────────
    const membre = await this.prisma.membre.findUnique({
      where: { numeroCompte },
    });
    if (!membre) {
      throw new BadRequestException("Le membre n'existe pas");
    }

    // ── 2. Vérifier la trésorerie disponible ─────────────────────────
    const tresorerie = await this.balancesService.getTresorerieDisponible();

    const deviseKey = devise === 'USD' ? 'usd' : 'fc';
    const disponible = tresorerie[deviseKey].disponible;

    if (montant > disponible) {
      this.logger.warn(
        `❌ Trésorerie insuffisante: demandé ${montant} ${devise}, disponible ${disponible} ${devise}`,
      );
      throw new BadRequestException(
        `Trésorerie insuffisante. Montant demandé: ${montant} ${devise}. ` +
        `Disponible après réserve de 20%: ${disponible} ${devise}. ` +
        `Caisse totale: ${tresorerie[deviseKey].caisse} ${devise}, ` +
        `Réserve obligatoire: ${tresorerie[deviseKey].reserve} ${devise}, ` +
        `Encours crédits: ${tresorerie[deviseKey].encoursCredits} ${devise}.`,
      );
    }

    this.logger.log(`✅ Trésorerie validée: disponible ${disponible} ${devise}`);

    // ── 3. Calculer les dates ────────────────────────────────────────
    const dateD = new Date(dateDebut);
    const dateEcheance = new Date(dateD);
    dateEcheance.setMonth(dateEcheance.getMonth() + duree);

    // ── 4. Transaction Prisma : double écriture comptable ────────────
    const credit = await this.prisma.$transaction(async (tx) => {
      // 4.1 Créer l'enregistrement du crédit
      const credit = await tx.credit.create({
        data: {
          numeroCompte,
          montant,
          devise,
          tauxInteret,
          duree,
          dateDebut: dateD,
          dateEcheance,
          statut: StatutCredit.actif,
          description: createDto.description,
          derniereOperation: dateD,
        },
      });

      this.logger.log(`📝 Crédit #${credit.id} créé: ${montant} ${devise}`);

      // 4.2 Enregistrer la sortie de trésorerie (décaissement)
      const sectionTrigram = getSectionTrigram(membre.typeCompte);
      const compteCreditSection = `MW-${sectionTrigram}-CREDITS`;

      await tx.epargne.create({
        data: {
          compte: compteCreditSection,
          typeOperation: 'retrait',
          devise: devise as Devise,
          montant,
          dateOperation: dateD,
          description: `Décaissement crédit #${credit.id} pour ${numeroCompte} (${membre.nomComplet})`,
        },
      });

      this.logger.log(`📝 Sortie trésorerie section: ${compteCreditSection} -${montant} ${devise}`);

      // 4.3 Enregistrer aussi une sortie sur la caisse globale
      await tx.epargne.create({
        data: {
          compte: 'MW-TRESORERIE-CREDITS',
          typeOperation: 'retrait',
          devise: devise as Devise,
          montant,
          dateOperation: dateD,
          description: `Décaissement crédit #${credit.id} membre ${numeroCompte} (via ${membre.typeCompte})`,
        },
      });

      this.logger.log(`📝 Sortie trésorerie globale: MW-TRESORERIE-CREDITS -${montant} ${devise}`);
      this.logger.log(`✅ Crédit #${credit.id} décaissé avec succès`);

      return credit;
    });

    // Appel à la libération dynamique de la garantie
    await this.balancesService.rafraichirGarantie(membre.id);
    this.logger.log(`🔒 Garantie recalculée pour membre #${membre.id}`);
    return credit;
  }
}
