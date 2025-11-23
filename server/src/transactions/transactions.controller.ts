import { Controller, Get, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Get()
    findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('type') type?: string,
        @Query('search') search?: string,
    ) {
        return this.transactionsService.findAll({ page, limit, type, search });
    }
}
