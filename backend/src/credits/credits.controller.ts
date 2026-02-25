import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CreditsService } from './credits.service';
import { RemboursementsService } from '../remboursements/remboursements.service';
import { CreateCreditDto } from './dto/create-credit.dto';
import { CreateRemboursementDto } from '../remboursements/dto/create-remboursement.dto';

@Controller('api/credits')
export class CreditsController {
  constructor(
    private readonly creditsService: CreditsService,
    @Inject(forwardRef(() => RemboursementsService))
    private readonly remboursementsService: RemboursementsService,
  ) {}

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

  @Post('remboursements')
  async addRemboursement(@Body() dto: CreateRemboursementDto) {
    return this.remboursementsService.create(dto);
  }
}
