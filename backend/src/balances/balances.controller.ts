import { Controller, Get, Param } from '@nestjs/common';
import { BalancesService } from './balances.service';

@Controller('api/solde')
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  @Get('total')
  async getTotal() {
    return this.balancesService.getTotal();
  }

  @Get('type/:type_compte')
  async getByType(@Param('type_compte') typeCompte: string) {
    return this.balancesService.getByType(typeCompte);
  }

  @Get('frais-retraits')
  async getFraisRetraits() {
    return this.balancesService.getFraisRetraits();
  }
}
