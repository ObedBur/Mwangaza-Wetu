import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('api/rapport')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async getRapport(
    @Query('type') type: string,
    @Query('periode') periode: string,
  ) {
    return this.reportsService.getRapport(type, periode);
  }
}
