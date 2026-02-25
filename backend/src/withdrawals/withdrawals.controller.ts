import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';

@Controller('api/withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Get()
  async findAll() {
    return this.withdrawalsService.findAll();
  }

  @Get('compte/:compte')
  async findByCompte(@Param('compte') compte: string) {
    return this.withdrawalsService.findByCompte(compte);
  }

  @Post('verify-limites')
  async verify(
    @Body() body: { compte: string; montant: number; devise: string },
  ) {
    return this.withdrawalsService.verifyLimites(
      body.compte,
      body.montant,
      body.devise,
    );
  }

  @Post()
  async create(@Body() dto: CreateWithdrawalDto) {
    return this.withdrawalsService.create(dto);
  }
}
