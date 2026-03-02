import { Controller, Get, Post, Body, Param, ValidationPipe, Query } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';

@Controller('api/withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize) : 10;
    const retraits = await this.withdrawalsService.findAll();

    // Appliquer la pagination manuellement côté contrôleur
    const skip = (pageNum - 1) * pageSizeNum;
    const paginatedData = retraits.slice(skip, skip + pageSizeNum);

    return {
      data: this.mapRetraitsToResponse(paginatedData),
      meta: {
        total: retraits.length,
        page: pageNum,
        pageSize: pageSizeNum,
        totalPages: Math.ceil(retraits.length / pageSizeNum),
        hasNextPage: pageNum * pageSizeNum < retraits.length,
        hasPrevPage: pageNum > 1,
      },
    };
  }

  @Get('compte/:compte')
  async findByCompte(@Param('compte') compte: string) {
    const retraits = await this.withdrawalsService.findByCompte(compte);
    return this.mapRetraitsToResponse(retraits);
  }

  @Post('verify-limites')
  async verify(
    @Body(new ValidationPipe({ whitelist: true })) body: { compte: string; montant: number; devise: string },
  ) {
    return this.withdrawalsService.verifyLimites(
      body.compte,
      body.montant,
      body.devise,
    );
  }

  @Post()
  async create(@Body(new ValidationPipe({ whitelist: true })) dto: CreateWithdrawalDto) {
    const retrait = await this.withdrawalsService.create(dto);
    return this.mapRetraitToResponse(retrait);
  }

  // ─── Mappage privé pour transformer les données ─────────────────
  private mapRetraitToResponse(retrait: any) {
    if (!retrait) return null;

    return {
      id: retrait.id,
      dateISO: new Date(retrait.dateOperation).toISOString().split('T')[0],
      time: new Date(retrait.dateOperation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      accountNumber: retrait.compte,
      memberName: retrait.membre?.nomComplet || 'N/A',
      amount: Number(retrait.montant),
      currency: retrait.devise,
      reason: retrait.description || '-',
      status: retrait.statut?.toLowerCase() || 'completed',
      frais: Number(retrait.frais),
      soldeAvant: Number(retrait.soldeAvant),
      soldeApres: Number(retrait.soldeApres),
    };
  }

  private mapRetraitsToResponse(retraits: any[]) {
    if (!Array.isArray(retraits)) return [];
    return retraits.map(r => this.mapRetraitToResponse(r));
  }
}
