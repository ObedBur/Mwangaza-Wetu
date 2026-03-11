import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { AccountingService } from './accounting.service';

@Controller('accounting')
export class AccountingController {
    constructor(private readonly accountingService: AccountingService) { }

    @Get()
    async findAll(
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string,
        @Query('search') search?: string,
    ) {
        return this.accountingService.findAll(
            page ? parseInt(page) : 1,
            pageSize ? parseInt(pageSize) : 10,
            search,
        );
    }
}
