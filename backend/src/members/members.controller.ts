import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { getSectionTrigram, normalizeSectionName } from '../common/constants/sections';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Membres')
@ApiBearerAuth('JWT-auth')
@Controller('api/membres')
@UseGuards(JwtAuthGuard, ThrottlerGuard, RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) { }

  /**
   * Liste paginée des membres.
   * Accessible à tous les utilisateurs authentifiés.
   */
  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('userId') userId?: string,
  ) {
    return this.membersService.findAll({ page, pageSize, userId });
  }

  /**
   * Statistiques globales des membres.
   * Accessible à tous les utilisateurs authentifiés.
   */
  @Get('stats')
  async getStats() {
    return this.membersService.getStats();
  }

  /**
   * Liste des numéros de compte — réservé aux administrateurs.
   * Retourne jusqu'à 1000 membres, donc restreint pour éviter un dump de données.
   */
  @Get('numeros')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async getNumeros() {
    const response = await this.membersService.findAll({ pageSize: 1000 });
    return response.data.map((m) => ({
      id: m.id,
      numero_compte: m.numeroCompte,
      nom_complet: m.nomComplet,
    }));
  }

  /**
   * Génère un numéro de compte pour une section donnée.
   */
  @Get('generate-numero')
  async generateNumero(
    @Query('year', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe) year: number,
    @Query('section') section?: string,
  ) {
    const sectionTrigram = section ? getSectionTrigram(normalizeSectionName(section)) : undefined;
    const numero = await this.membersService.generateNumero(year, sectionTrigram);
    return { numero };
  }

  /**
   * Retourne le prochain numéro séquentiel disponible.
   */
  @Get('last-numero')
  async getLastNumero(
    @Query('year', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe) year: number,
    @Query('section') section?: string,
  ) {
    const sectionTrigram = section ? getSectionTrigram(normalizeSectionName(section)) : undefined;
    const numero_compte = await this.membersService.generateNumero(year, sectionTrigram);
    const match = numero_compte.match(/-(\d{4})$/);
    const nextNumber = match ? parseInt(match[1]) : 1;
    return { nextNumber };
  }

  /**
   * Vérifie si un userId ZKTeco est déjà utilisé.
   */
  @Get('check-userid/:userId')
  async checkUserId(
    @Param('userId') userId: string,
    @Query('exclude', new DefaultValuePipe(0), ParseIntPipe) exclude: number,
  ) {
    const excludeId = exclude > 0 ? exclude : undefined;
    return this.membersService.checkUserId(userId, excludeId);
  }

  /**
   * Dashboard d'un membre.
   * Protection IDOR : un membre ne peut consulter que son propre dashboard.
   * Les admins peuvent consulter n'importe quel dashboard.
   */
  @Get('dashboard/:identifier')
  async getMemberDashboard(
    @Param('identifier') identifier: string,
    @Request() req: any,
  ) {
    const user = req.user;
    if (user.role === 'membre') {
      // Un membre ne peut accéder qu'à son propre dashboard
      const isOwnAccount =
        String(user.id) === identifier ||
        user.numeroCompte === identifier;
      if (!isOwnAccount) {
        throw new ForbiddenException('Vous ne pouvez accéder qu\'à votre propre tableau de bord.');
      }
    }
    return this.membersService.getMemberDashboard(identifier);
  }

  @Get('by-zkid/:zkId')
  async findByZkId(@Param('zkId') zkId: string) {
    return this.membersService.findByZkId(zkId);
  }

  @Get('by-numero/:numero')
  async findByNumero(@Param('numero') numero: string) {
    return this.membersService.findByNumero(numero);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.findOne(id);
  }

  /**
   * Créer un membre — réservé aux admins et super-admins.
   */
  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  /**
   * Modifier un membre — réservé aux admins et super-admins.
   */
  @Put(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: Partial<CreateMemberDto>,
  ) {
    return this.membersService.update(id, updateDto);
  }

  /**
   * Supprimer un membre — réservé aux admins et super-admins.
   */
  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.remove(id);
  }
}
