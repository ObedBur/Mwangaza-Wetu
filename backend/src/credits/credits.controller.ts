import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CreditsService } from './credits.service';
import { CreateCreditDto } from './dto/create-credit.dto';

@Controller('api/credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) { }

  @Get('stats')
  async getStats() {
    return this.creditsService.getStats();
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize) : 10;

    return this.creditsService.findAllPaginated(pageNum, pageSizeNum);
  }

  @Get('soldes')
  async getSoldes() {
    return this.creditsService.getSoldes();
  }

  @Get('membre/:numero')
  async findByMembre(@Param('numero') numero: string) {
    return this.creditsService.findByMembre(numero);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.creditsService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: CreateCreditDto) {
    return this.creditsService.create(createDto);
  }
}
