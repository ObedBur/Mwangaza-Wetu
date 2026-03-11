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
  UseGuards,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { getSectionLetter, normalizeSectionName } from '../common/constants/sections';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('api/membres')
@UseGuards(JwtAuthGuard, ThrottlerGuard, RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('userId') userId?: string,
  ) {
    return this.membersService.findAll({
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 10,
      userId,
    });
  }

  @Get('stats')
  async getStats() {
    return this.membersService.getStats();
  }

  @Get('numeros')
  async getNumeros() {
    const response = await this.membersService.findAll({ pageSize: 1000 });
    return response.data.map((m) => ({
      id: m.id,
      numero_compte: m.numeroCompte,
      nom_complet: m.nomComplet,
    }));
  }

  @Get('generate-numero')
  async generateNumero(
    @Query('year') year?: string,
    @Query('section') section?: string,
  ) {
    const y = year ? parseInt(year) : new Date().getFullYear();
    const sectionLetter = section ? getSectionLetter(normalizeSectionName(section)) : undefined;
    const numero = await this.membersService.generateNumero(y, sectionLetter);
    return { numero };
  }

  @Get('last-numero')
  async getLastNumero(
    @Query('year') year?: string,
    @Query('section') section?: string,
  ) {
    const y = year ? parseInt(year) : new Date().getFullYear();
    const sectionLetter = section ? getSectionLetter(normalizeSectionName(section)) : undefined;
    const numero_compte = await this.membersService.generateNumero(y, sectionLetter);
    const match = numero_compte.match(/-(\d{4})$/);
    const nextNumber = match ? parseInt(match[1]) : 1;
    return { nextNumber };
  }

  @Get('check-userid/:userId')
  async checkUserId(
    @Param('userId') userId: string,
    @Query('exclude') exclude?: string,
  ) {
    const excludeId = exclude ? parseInt(exclude) : undefined;
    return this.membersService.checkUserId(userId, excludeId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.findOne(id);
  }

  @Get('by-zkid/:zkId')
  async findByZkId(@Param('zkId') zkId: string) {
    return this.membersService.findByZkId(zkId);
  }

  @Get('by-numero/:numero')
  async findByNumero(@Param('numero') numero: string) {
    return this.membersService.findByNumero(numero);
  }

  @Get('dashboard/:identifier')
  async getMemberDashboard(@Param('identifier') identifier: string) {
    return this.membersService.getMemberDashboard(identifier);
  }

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: Partial<CreateMemberDto>,
  ) {
    return this.membersService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.remove(id);
  }
}
