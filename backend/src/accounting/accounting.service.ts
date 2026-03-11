import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountingService {
    constructor(private prisma: PrismaService) { }

    async findAll(page: number = 1, pageSize: number = 10, search?: string) {
        const skip = (page - 1) * pageSize;

        // 1. Récupérer les données Epargne (Dépôts / Retraits)
        const epargnes = await this.prisma.epargne.findMany({
            where: search ? {
                OR: [
                    { description: { contains: search, mode: 'insensitive' } },
                    { compte: { contains: search, mode: 'insensitive' } },
                ]
            } : {},
            orderBy: { dateOperation: 'desc' },
            take: 200, // Limite raisonnable pour la fusion
        });

        // 2. Récupérer les Revenus
        const revenus = await this.prisma.revenu.findMany({
            where: search ? {
                OR: [
                    { sourceCompte: { contains: search, mode: 'insensitive' } },
                ]
            } : {},
            orderBy: { dateOperation: 'desc' },
            take: 200,
        });

        // 3. Fusionner et transformer
        const entries = [
            ...epargnes.map(e => ({
                id: `ep-${e.id}`,
                date: e.dateOperation.toISOString(),
                type: e.typeOperation === 'depot' ? 'income' : 'expense',
                category: 'Epargne',
                description: e.description || `Opération ${e.typeOperation} sur ${e.compte}`,
                debit: e.typeOperation === 'retrait' ? Number(e.montant) : 0,
                credit: e.typeOperation === 'depot' ? Number(e.montant) : 0,
                currency: e.devise,
                reference: e.compte,
                status: 'validated',
                attachments: 0,
            })),
            ...revenus.map(r => ({
                id: `rev-${r.id}`,
                date: r.dateOperation.toISOString(),
                type: 'income',
                category: 'Revenu',
                description: `Revenu système depuis ${r.sourceCompte || 'interne'}`,
                debit: 0,
                credit: Number(r.montant),
                currency: r.devise,
                reference: r.sourceCompte || 'SYS',
                status: 'validated',
                attachments: 0,
            }))
        ];

        // Trier par date descendante
        const sortedEntries = entries.sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Pagination manuelle après fusion
        const paginatedEntries = sortedEntries.slice(skip, skip + pageSize);

        return {
            data: paginatedEntries,
            meta: {
                total: sortedEntries.length,
                page,
                pageSize,
                totalPages: Math.ceil(sortedEntries.length / pageSize),
            }
        };
    }
}
