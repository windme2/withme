import { Controller, Get, Post, Patch, Body, Query, Param } from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';

@Controller('sales/orders')
export class SalesOrdersController {
    constructor(private readonly salesOrdersService: SalesOrdersService) { }

    @Get()
    findAll(@Query('status') status?: string, @Query('search') search?: string) {
        return this.salesOrdersService.findAll(status, search);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.salesOrdersService.findOne(id);
    }

    @Post()
    create(@Body() createDto: any) {
        return this.salesOrdersService.create(createDto);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
        return this.salesOrdersService.updateStatus(id, body.status);
    }
}
