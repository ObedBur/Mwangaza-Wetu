import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { SavingsService } from './savings.service';
import { CreateSavingsDto, TypeOperation } from './dto/create-savings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Épargnes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, ThrottlerGuard, RolesGuard)
@Controller('api/epargnes')
export class SavingsController {
  constructor(private readonly savingsService: SavingsService) {}

  /**
   * Liste paginée de toutes les opérations d'épargne.
   * Accessible à tous les utilisateurs authentifiés.
   */
  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('type') type?: TypeOperation,
  ) {
    return this.savingsService.findAll({ page, pageSize, type });
  }

  /**
   * Liste paginée des dépôts uniquement.
   */
  @Get('depots')
  async getDepots(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    return this.savingsService.findAll({ page, pageSize, type: TypeOperation.depot });
  }

  /**
   * Liste paginée des retraits uniquement.
   */
  @Get('retraits')
  async getRetraits(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    return this.savingsService.findAll({ page, pageSize, type: TypeOperation.retrait });
  }

  /**
   * Transactions d'un compte spécifique.
   * Protection IDOR : un membre ne peut voir que ses propres transactions.
   */
  @Get('compte/:compte')
  async findByCompte(
    @Param('compte') compte: string,
    @Request() req: any,
  ) {
    const user = req.user;
    if (user.role === 'membre' && user.numeroCompte !== compte) {
      throw new ForbiddenException('Vous ne pouvez consulter que vos propres transactions.');
    }
    return this.savingsService.findByCompte(compte);
  }

  /**
   * Soldes d'un compte spécifique.
   * Protection IDOR : un membre ne peut voir que son propre solde.
   */
  @Get('soldes/:numero')
  async getSoldes(
    @Param('numero') numero: string,
    @Request() req: any,
  ) {
    const user = req.user;
    if (user.role === 'membre' && user.numeroCompte !== numero) {
      throw new ForbiddenException('Vous ne pouvez consulter que votre propre solde.');
    }
    return this.savingsService.getSoldes(numero);
  }

  /**
   * Totaux globaux de tous les comptes — réservé aux administrateurs.
   */
  @Get('totals-all')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async getTotalsAll() {
    return this.savingsService.getTotalsAll();
  }

  /**
   * Solde total par type de compte — réservé aux administrateurs.
   */
  @Get('by-type/:type')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async getByType(@Param('type') type: string) {
    return this.savingsService.getSoldeByTypeCompte(type);
  }

  /**
   * Créer une opération d'épargne (dépôt ou retrait).
   * Réservé aux administrateurs — seuls les agents de la coopérative saisissent les transactions.
   */
  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async create(@Body() createDto: CreateSavingsDto) {
    return this.savingsService.create(createDto);
  }

  /**
   * Supprimer une opération d'épargne.
   * Réservé aux administrateurs.
   */
  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.savingsService.remove(id);
  }
}
