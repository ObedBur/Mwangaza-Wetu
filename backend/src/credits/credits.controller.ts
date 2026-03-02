import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CreditsService } from './credits.service';
import { CreateCreditDto } from './dto/create-credit.dto';

@Controller('api/credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get()
  async findAll() {
    return this.creditsService.findAll();
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
