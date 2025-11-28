import { Controller, Get, Post, Patch, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
    @UseGuards(JwtAuthGuard)
    create(@Body() createDto: any, @Request() req: any) {
        return this.salesOrdersService.create(createDto, req.user.id);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
        return this.salesOrdersService.updateStatus(id, body.status);
    }
}
