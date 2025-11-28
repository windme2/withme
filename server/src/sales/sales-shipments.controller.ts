import { Controller, Get, Post, Patch, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { SalesShipmentsService } from './sales-shipments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sales/shipments')
export class SalesShipmentsController {
    constructor(private readonly shipmentsService: SalesShipmentsService) { }

    @Get()
    findAll(@Query('status') status?: string, @Query('search') search?: string) {
        return this.shipmentsService.findAll(status, search);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.shipmentsService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() createDto: any, @Request() req: any) {
        return this.shipmentsService.create(createDto, req.user.id);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
        return this.shipmentsService.updateStatus(id, body.status);
    }
}
