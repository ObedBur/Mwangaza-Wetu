import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { SavingsService } from './savings.service';
import { CreateSavingsDto, TypeOperation } from './dto/create-savings.dto';

@Controller('api/epargnes')
export class SavingsController {
  constructor(private readonly savingsService: SavingsService) {}

  @Get()
  async findAll(@Query('type') type?: TypeOperation) {
    return this.savingsService.findAll(type);
  }

  @Get('depots')
  async getDepots() {
    return this.savingsService.findAll(TypeOperation.DEPOT);
  }

  @Get('retraits')
  async getRetraits() {
    return this.savingsService.findAll(TypeOperation.RETRAIT);
  }

  @Get('compte/:compte')
  async findByCompte(@Param('compte') compte: string) {
    return this.savingsService.findByCompte(compte);
  }

  @Get('soldes/:numero')
  async getSoldes(@Param('numero') numero: string) {
    return this.savingsService.getSoldes(numero);
  }

  @Get('totals-all')
  async getTotalsAll() {
    return this.savingsService.getTotalsAll();
  }

  @Get('by-type/:type')
  async getByType(@Param('type') type: string) {
    return this.savingsService.getSoldeByTypeCompte(type);
  }

  @Post()
  async create(@Body() createDto: CreateSavingsDto) {
    return this.savingsService.create(createDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.savingsService.remove(id);
  }
}
