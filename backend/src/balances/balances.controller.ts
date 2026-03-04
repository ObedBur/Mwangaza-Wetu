import { Controller, Get, Param, Query } from '@nestjs/common';
import { BalancesService } from './balances.service';
import { ParseIntPipe } from '@nestjs/common';

@Controller('api/solde')
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) { }

  @Get('total')
  async getTotal() {
    return this.balancesService.getTotal();
  }

  @Get('dashboard')
  async getDashboard() {
    return this.balancesService.getDashboardOverview();
  }

  @Get('type/:type_compte')
  async getByType(@Param('type_compte') typeCompte: string) {
    return this.balancesService.getByType(typeCompte);
  }

  @Get('frais-retraits')
  async getFraisRetraits() {
    return this.balancesService.getFraisRetraits();
  }

  @Get('tresorerie')
  async getTresorerieDisponible() {
    return this.balancesService.getTresorerieDisponible();
  }

  @Get('membre/:numero/disponible')
  async getSoldeDisponibleMembre(@Param('numero') numero: string) {
    return this.balancesService.getSoldeDisponibleMembre(numero);
  }

  @Get('membre/:membreId/garantie')
  async getGarantieMembre(@Param('membreId', ParseIntPipe) membreId: number, @Query('taux') tauxGarantie?: string) {
    // tauxGarantie is optional, default to 0.3
    const taux = tauxGarantie ? Number(tauxGarantie) : 0.3;
    return this.balancesService.rafraichirGarantie(membreId, taux);
  }
}
