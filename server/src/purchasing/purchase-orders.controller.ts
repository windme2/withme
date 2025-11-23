import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';

@Controller('purchasing/orders')
export class PurchaseOrdersController {
    constructor(private readonly purchaseOrdersService: PurchaseOrdersService) { }

    @Get()
    findAll(@Query('status') status?: string, @Query('search') search?: string) {
        return this.purchaseOrdersService.findAll(status, search);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.purchaseOrdersService.findOne(id);
    }

    @Post()
    create(@Body() createDto: any) {
        return this.purchaseOrdersService.create(createDto);
    }
}
