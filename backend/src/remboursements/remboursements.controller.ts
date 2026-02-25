import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { RemboursementsService } from './remboursements.service';
import { CreateRemboursementDto } from './dto/create-remboursement.dto';

@Controller('api/remboursements')
export class RemboursementsController {
  constructor(private readonly remboursementsService: RemboursementsService) {}

  @Get()
  async findAll() {
    return this.remboursementsService.findAll();
  }

  @Get('credit/:creditId')
  async findByCredit(@Param('creditId', ParseIntPipe) creditId: number) {
    return this.remboursementsService.findByCredit(creditId);
  }

  @Post('add')
  async create(@Body() dto: CreateRemboursementDto) {
    return this.remboursementsService.create(dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.remboursementsService.remove(id);
  }
}
