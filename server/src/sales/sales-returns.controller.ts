import { Controller, Get, Post, Patch, Body, Query, Param } from '@nestjs/common';
import { SalesReturnsService } from './sales-returns.service';

@Controller('sales/returns')
export class SalesReturnsController {
    constructor(private readonly returnsService: SalesReturnsService) { }

    @Get()
    findAll(@Query('status') status?: string, @Query('search') search?: string) {
        return this.returnsService.findAll(status, search);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.returnsService.findOne(id);
    }

    @Post()
    create(@Body() createDto: any) {
        return this.returnsService.create(createDto);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
        return this.returnsService.updateStatus(id, body.status);
    }
}
