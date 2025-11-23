import { Controller, Get, Post, Body, Query, Param, Patch } from '@nestjs/common';
import { PurchasingService } from './purchasing.service';

@Controller('purchasing/requisitions')
export class PurchasingController {
    constructor(private readonly purchasingService: PurchasingService) { }

    @Get()
    findAll(@Query('status') status?: string, @Query('search') search?: string) {
        return this.purchasingService.findAll(status, search);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.purchasingService.findOne(id);
    }

    @Post()
    create(@Body() createDto: any) {
        // Hardcoded userId for now until Auth is implemented
        const userId = 'user-admin-001';
        return this.purchasingService.create({ ...createDto, userId });
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.purchasingService.updateStatus(id, status);
    }
}
