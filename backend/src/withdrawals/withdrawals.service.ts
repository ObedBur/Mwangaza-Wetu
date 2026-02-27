import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { Devise, TypeOperationEpargne } from '@prisma/client';
import { ParametresService } from '../parametres/parametres.service';

@Injectable()
export class WithdrawalsService {
  constructor(
    private prisma: PrismaService,
    private parametresService: ParametresService,
  ) {}

  private async getFeesConfig(devise: string) {
    const params = await this.parametresService.getGeneralParameters();
    if (
      params.retraits?.frais_retrait &&
      params.retraits.frais_retrait[devise]
    ) {
      return params.retraits.frais_retrait[devise];
    }

    // Fallback
    if (devise === 'FC') {
      return [
        { max: 50000, taux: 0.03 },
        { max: 500000, taux: 0.025 },
        { max: 999999999, taux: 0.02 },
      ];
    }
    return [
      { max: 50, taux: 0.03 },
      { max: 500, taux: 0.025 },
      { max: 999999, taux: 0.02 },
    ];
  }

  private async calculateFees(montant: number, devise: string) {
    const structure = await this.getFeesConfig(devise);
    let frais = 0;
    let restant = montant;
    for (const palier of structure) {
      if (restant <= 0) break;
      const portion = Math.min(restant, palier.max);
      frais += portion * palier.taux;
      restant -= portion;
    }
    return Math.round(frais * 100) / 100;
  }

  async verifyLimites(compte: string, montant: number, devise: string) {
    const params = await this.parametresService.getGeneralParameters();

    // 1. Vérifier les heures autorisées
    const now = new Date();
    const heureActuelle = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (params.heures_autorisees) {
      if (
        heureActuelle < params.heures_autorisees.debut ||
        heureActuelle > params.heures_autorisees.fin
      ) {
        throw new BadRequestException(
          `Les retraits sont autorisés uniquement entre ${params.heures_autorisees.debut} et ${params.heures_autorisees.fin}`,
        );
      }
    }

    // 2. Vérifier montant minimum
    const montantMin =
      devise === 'FC'
        ? params.montant_min_retrait_fc
        : params.montant_min_retrait_usd;
    if (montant < montantMin) {
      throw new BadRequestException(
        `Le montant minimum de retrait est de ${montantMin} ${devise}`,
      );
    }

    // 3. Vérifier montant maximum par retrait
    const montantMax =
      devise === 'FC'
        ? params.montant_max_par_retrait_fc
        : params.montant_max_par_retrait_usd;
    if (montant > montantMax) {
      throw new BadRequestException(
        `Le montant maximum par retrait est de ${montantMax} ${devise}`,
      );
    }

    // 4. Vérifier solde disponible (incluant solde minimum requis)
    const epargneStats = await this.prisma.epargne.groupBy({
      by: ['typeOperation'],
      where: { compte, devise: devise as Devise },
      _sum: { montant: true },
    });

    const getSum = (type: TypeOperationEpargne) => {
      const item = epargneStats.find((s) => s.typeOperation === type);
      return Number(item ? item._sum.montant || 0 : 0);
    };

    const soldeActuel =
      Number(getSum(TypeOperationEpargne.depot)) - Number(getSum(TypeOperationEpargne.retrait));
    const soldeMin =
      devise === 'FC' ? params.solde_min_fc : params.solde_min_usd;

    if (soldeActuel - montant < soldeMin) {
      throw new BadRequestException(
        `Solde insuffisant. Solde minimum requis: ${soldeMin} ${devise}`,
      );
    }

    // 5. Vérifier limite quotidienne
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sumRetraitsAujourdhui = await this.prisma.epargne.aggregate({
      where: {
        compte,
        devise: devise as Devise,
        typeOperation: TypeOperationEpargne.retrait,
        dateOperation: {
          gte: today,
        },
      },
      _sum: { montant: true },
    });

    const totalAujourdhui = Number(sumRetraitsAujourdhui._sum.montant || 0);
    const limiteJour =
      devise === 'FC'
        ? params.limite_retrait_jour_fc
        : params.limite_retrait_jour_usd;

    if (totalAujourdhui + montant > limiteJour) {
      throw new BadRequestException(
        `Limite de retrait quotidienne dépassée: ${limiteJour} ${devise}`,
      );
    }

    return { success: true, soldeActuel };
  }

  async create(dto: CreateWithdrawalDto) {
    const { compte, montant, devise, dateOperation, description } = dto;
    const dateO = new Date(dateOperation);

    const { soldeActuel } = await this.verifyLimites(compte, montant, devise);

    const frais = await this.calculateFees(montant, devise);
    const soldeApres = soldeActuel - (montant + frais);

    return this.prisma.$transaction(async (tx) => {
      await tx.epargne.create({
        data: {
          compte,
          typeOperation: TypeOperationEpargne.retrait,
          devise: devise as Devise,
          montant,
          dateOperation: dateO,
          description,
        },
      });

      const retrait = await tx.retrait.create({
        data: {
          compte,
          devise: devise as Devise,
          montant,
          dateOperation: dateO,
          description,
          soldeAvant: soldeActuel,
          soldeApres: soldeApres,
          frais,
        },
      });

      if (frais > 0) {
        await tx.epargne.create({
          data: {
            compte: 'COOP-REVENUS',
            typeOperation: TypeOperationEpargne.depot,
            devise: devise as Devise,
            montant: frais,
            dateOperation: dateO,
            description: `Frais de retrait sur ${compte}`,
          },
        });
      }

      return retrait;
    });
  }

  async findAll() {
    return this.prisma.retrait.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCompte(compte: string) {
    return this.prisma.retrait.findMany({
      where: { compte },
      orderBy: { createdAt: 'desc' },
    });
  }
}
