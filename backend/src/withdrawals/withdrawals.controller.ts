import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ValidationPipe,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { VerifyLimitDto } from './dto/verify-limit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Retraits')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) { }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
  ) {
    const pageNum = page || 1;
    const pageSizeNum = pageSize || 10;
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
  async findByCompte(@Param('compte') compte: string, @Req() req: any) {
    const user = req.user;
    if (user.role === 'membre' && user.numeroCompte !== compte) {
      throw new ForbiddenException(
        'Vous ne pouvez consulter que vos propres retraits.',
      );
    }
    const retraits = await this.withdrawalsService.findByCompte(compte);
    return this.mapRetraitsToResponse(retraits);
  }

  @Post('verify-limites')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async verify(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: VerifyLimitDto,
  ) {
    // 1. Vérification de sécurité immédiate (Anti-crash)
    if (!dto || !dto.compte) {
      throw new BadRequestException(
        'Les informations de compte et de montant sont obligatoires',
      );
    }

    try {
      // 2. Appel au service avec capture d'erreurs métier
      return await this.withdrawalsService.verifyLimites(
        dto.compte,
        dto.montant,
        dto.devise,
      );
    } catch (error) {
      // 
      throw new BadRequestException(error.message || 'Erreur lors de la vérification des limites');
    }
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async create(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateWithdrawalDto,
    @Req() req: any,
  ) {
    try {
      const retrait = await this.withdrawalsService.create(dto, req.user.id);
      return this.mapRetraitToResponse(retrait);
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Erreur lors de la création du retrait',
      );
    }
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
