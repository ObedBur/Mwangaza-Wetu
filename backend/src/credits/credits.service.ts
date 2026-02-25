import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCreditDto, StatutCredit } from './dto/create-credit.dto';
import { Devise, StatutCredit as PrismaStatutCredit } from '@prisma/client';

@Injectable()
export class CreditsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.credit.findMany({
      orderBy: { createdAt: 'desc' },
      include: { remboursements: true },
    });
  }

  async findOne(id: number) {
    const credit = await this.prisma.credit.findUnique({
      where: { id },
      include: { remboursements: true },
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
    const credits = await this.prisma.credit.findMany({
      select: { montant: true, devise: true },
    });
    const soldeUSD = credits
      .filter((c) => c.devise === 'USD')
      .reduce((t, c) => t + (c.montant || 0), 0);
    const soldeFC = credits
      .filter((c) => c.devise === 'FC')
      .reduce((t, c) => t + (c.montant || 0), 0);
    return { soldeUSD, soldeFC };
  }

  async create(createDto: CreateCreditDto) {
    const { numeroCompte, montant, duree, dateDebut, devise } = createDto;

    // Vérifier le membre
    const membre = await this.prisma.membre.findUnique({
      where: { numeroCompte },
    });
    if (!membre) throw new BadRequestException("Le membre n'existe pas");

    const dateD = new Date(dateDebut);
    const dateEcheance = new Date(dateD);
    dateEcheance.setMonth(dateEcheance.getMonth() + duree);

    // Transaction Prisma
    return this.prisma.$transaction(async (tx) => {
      // 1. Créer le crédit
      const credit = await tx.credit.create({
        data: {
          numeroCompte,
          montant,
          devise: devise,
          tauxInteret: createDto.tauxInteret,
          duree,
          dateDebut: dateD,
          dateEcheance: dateEcheance,
          statut: StatutCredit.ACTIF as unknown as PrismaStatutCredit,
          description: createDto.description,
        },
      });

      // 2. Enregistrer le retrait sur le compte collectif
      const year = dateD.getFullYear();
      const lettre = (membre.typeCompte[0] || 'P').toUpperCase();
      const compteCollectif = `COOP-${lettre}-${year}-0000`;

      await tx.epargne.create({
        data: {
          compte: compteCollectif,
          typeOperation: 'retrait',
          devise: devise as Devise,
          montant: montant,
          dateOperation: dateD,
          description: `Octroi crédit à ${numeroCompte}`,
        },
      });

      return credit;
    });
  }
}
