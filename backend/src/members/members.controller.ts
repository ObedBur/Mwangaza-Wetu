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
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { getSectionLetter, normalizeSectionName } from '../common/constants/sections';

@Controller('api/membres')
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

  @Get('by-numero/:numero')
  async findByNumero(@Param('numero') numero: string) {
    return this.membersService.findByNumero(numero);
  }

  @Post()
  async create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: Partial<CreateMemberDto>,
  ) {
    return this.membersService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.remove(id);
  }
}
