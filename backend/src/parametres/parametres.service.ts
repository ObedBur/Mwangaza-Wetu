import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateParametreDto } from './dto/update-parametre.dto';

export interface GeneralParameters {
  solde_min_fc: number;
  solde_min_usd: number;
  montant_min_retrait_fc: number;
  montant_min_retrait_usd: number;
  montant_min_depot_fc?: number;
  montant_min_depot_usd?: number;
  limite_retrait_jour_fc: number;
  limite_retrait_jour_usd: number;
  max_retraits_par_jour: number;
  montant_max_par_retrait_fc: number;
  montant_max_par_retrait_usd: number;
  heures_autorisees: { debut: string; fin: string };
  motif_obligatoire: boolean;
  retraits?: {
    frais_retrait?: {
      [devise: string]: { max: number; taux: number }[];
    };
  };
}

@Injectable()
export class ParametresService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.parametreEpargne.findMany({
      orderBy: { nomParametre: 'asc' },
    });
  }

  async findByName(nom: string) {
    const param = await this.prisma.parametreEpargne.findUnique({
      where: { nomParametre: nom },
    });
    if (!param) throw new NotFoundException(`Paramètre ${nom} non trouvé`);
    return param;
  }

  async update(nom: string, dto: UpdateParametreDto) {
    const param = await this.prisma.parametreEpargne.findUnique({
      where: { nomParametre: nom },
    });
    if (!param) throw new NotFoundException(`Paramètre ${nom} non trouvé`);

    return this.prisma.parametreEpargne.update({
      where: { nomParametre: nom },
      data: {
        valeur: dto.valeur,
        description: dto.description,
      },
    });
  }

  async getValeur(nom: string, defaultValue?: string): Promise<string> {
    try {
      const param = await this.prisma.parametreEpargne.findUnique({
        where: { nomParametre: nom },
      });
      return param ? param.valeur : (defaultValue ?? '');
    } catch {
      return defaultValue ?? '';
    }
  }

  async getGeneralParameters(): Promise<GeneralParameters> {
    const val = await this.getValeur('parametres_generaux');
    if (!val) {
      // Return defaults if not in DB
      return {
        solde_min_fc: 10000,
        solde_min_usd: 5,
        montant_min_retrait_fc: 5000,
        montant_min_retrait_usd: 5,
        limite_retrait_jour_fc: 50000000,
        limite_retrait_jour_usd: 5000000,
        max_retraits_par_jour: 5,
        montant_max_par_retrait_fc: 500000,
        montant_max_par_retrait_usd: 500,
        heures_autorisees: { debut: '08:00', fin: '22:00' },
        motif_obligatoire: true,
        retraits: {
          frais_retrait: {
            FC: [
              { max: 50000, taux: 0.03 },
              { max: 500000, taux: 0.025 },
              { max: 999999999, taux: 0.02 },
            ],
            USD: [
              { max: 50, taux: 0.03 },
              { max: 500, taux: 0.025 },
              { max: 999999, taux: 0.02 },
            ],
          },
        },
      };
    }
    try {
      return JSON.parse(val) as GeneralParameters;
    } catch {
      // Fallback if parsing fails
      return {} as GeneralParameters;
    }
  }
}
